from django.contrib.auth.models import User
from django.db import models
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from io import BytesIO
from xhtml2pdf import pisa
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import UserProfile, Tenant, Booking
from .tenant import ensure_tenant_for_user


def _render_to_pdf(template_src, context_dict):
    try:
        html = render_to_string(template_src, context_dict)
        result = BytesIO()
        pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
        if not pdf.err:
            return result.getvalue()
        return None
    except Exception:
        return None

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=4)
    email = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('El nombre de usuario ya existe.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError('El email ya está en uso.')
        return value

    def validate(self, data):
        password = data.get('password')
        confirm = data.get('confirm_password')
        if password != confirm:
            raise serializers.ValidationError({'confirm_password': 'Las contraseñas no coinciden.'})
        # Validar fortaleza de contraseña usando validadores de Django
        try:
            validate_password(password)
        except Exception as e:
            # Consolidar errores en un mensaje legible
            raise serializers.ValidationError({'password': [str(err) for err in getattr(e, 'error_list', [e])]})
        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data.get('email') or '',
            first_name=validated_data.get('first_name') or '',
            last_name=validated_data.get('last_name') or '',
        )
        # Crear perfil por defecto como empleado
        UserProfile.objects.create(user=user, role='employee')
        return user


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({'message': 'Registro exitoso', 'user': _serialize_user(user)}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Credenciales inválidas.')
        data['user'] = user
        return data


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            from rest_framework_simplejwt.tokens import RefreshToken
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            role = request.user.profile.role
        except UserProfile.DoesNotExist:
            role = 'employee'
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'role': role,
            'email': request.user.email,
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        # Actualizar datos del propio usuario y perfil
        user = request.user
        for field in ['email', 'first_name', 'last_name']:
            if field in request.data:
                setattr(user, field, request.data.get(field) or '')
        user.save()
        # Actualizar campos del perfil si existen
        try:
            profile = user.profile
        except UserProfile.DoesNotExist:
            profile = UserProfile.objects.create(user=user, role='employee')
        for pfield in ['phone', 'department', 'position', 'address']:
            if pfield in request.data:
                setattr(profile, pfield, request.data.get(pfield))
        if 'birth_date' in request.data:
            profile.birth_date = request.data.get('birth_date')
        if 'hire_date' in request.data:
            profile.hire_date = request.data.get('hire_date')
        profile.save()
        return Response(_serialize_user(user), status=status.HTTP_200_OK)


def _serialize_user(user: User):
    try:
        role = user.profile.role
    except UserProfile.DoesNotExist:
        role = 'employee'
    # Intentar obtener campos del perfil
    department = None
    position = None
    phone = None
    try:
        department = getattr(user.profile, 'department', None)
        position = getattr(user.profile, 'position', None)
        phone = getattr(user.profile, 'phone', None)
    except UserProfile.DoesNotExist:
        pass
    return {
        'id': user.id,
        'username': user.username,
        'role': role,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'department': department,
        'position': position,
        'phone': phone,
    }

# Helper seguro para obtener el rol sin provocar 500 si no hay perfil
def _get_user_role(user: User) -> str:
    try:
        return user.profile.role
    except UserProfile.DoesNotExist:
        return 'employee'

# Helper seguro para obtener el tenant del usuario (admin o empleado)
def _get_user_tenant(user: User):
    # Intentar por perfil
    try:
        profile = user.profile
        return getattr(profile, 'tenant', None)
    except UserProfile.DoesNotExist:
        pass
    # Intentar por relación OneToOne de admin
    return Tenant.objects.filter(admin=user).first()


class UsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Solo administradores pueden listar usuarios (empleados)
        if _get_user_role(request.user) != 'admin':
            return Response({'detail': 'Solo administradores pueden gestionar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        # Limitar a empleados del mismo tenant
        ensure_tenant_for_user(request.user)
        admin_tenant = _get_user_tenant(request.user)
        users_qs = User.objects.filter(profile__role='employee', profile__tenant=admin_tenant).select_related('profile')
        # Búsqueda simple
        q = request.query_params.get('q')
        if q:
            users_qs = users_qs.filter(
                models.Q(username__icontains=q) |
                models.Q(first_name__icontains=q) |
                models.Q(last_name__icontains=q) |
                models.Q(email__icontains=q)
            )
        # Paginación simple por página
        try:
            page = int(request.query_params.get('page', '1'))
            page_size = int(request.query_params.get('page_size', '20'))
        except ValueError:
            page = 1
            page_size = 20
        if page < 1:
            page = 1
        if page_size < 1:
            page_size = 20
        total = users_qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        results = [_serialize_user(u) for u in users_qs[start:end]]
        return Response({'total': total, 'page': page, 'page_size': page_size, 'results': results}, status=status.HTTP_200_OK)

    def post(self, request):
        # Reglas de creación por rol
        requester_role = _get_user_role(request.user)
        username = request.data.get('username')
        password = request.data.get('password')
        # Si es super_admin puede elegir rol; si es admin, siempre empleado
        target_role = request.data.get('role') if requester_role == 'super_admin' else 'employee'
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        department = request.data.get('department')
        position = request.data.get('position')
        if not username or not password:
            return Response({'detail': 'Usuario y contraseña son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        # Validar permisos según rol del solicitante
        if requester_role == 'super_admin':
            if target_role not in ('admin', 'employer'):
                return Response({'detail': 'Super Administrador solo puede crear usuarios de tipo Administrador o Empleador.'}, status=status.HTTP_403_FORBIDDEN)
        elif requester_role == 'admin':
            if target_role != 'employee':
                return Response({'detail': 'Administrador solo puede crear usuarios de tipo Empleado.'}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({'detail': 'Empleados no tienen permisos para crear usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        if User.objects.filter(username=username).exists():
            return Response({'detail': 'El nombre de usuario ya existe.'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password)
        user.first_name = first_name or ''
        user.last_name = last_name or ''
        user.email = email or ''
        user.save()
        if target_role == 'employee':
            # Vincular al tenant del administrador
            ensure_tenant_for_user(request.user)
            admin_tenant = _get_user_tenant(request.user)
            UserProfile.objects.create(
                user=user,
                role='employee',
                phone=phone,
                department=department,
                position=position,
                tenant=admin_tenant,
            )
        else:
            # Admin y Empleador no se vinculan a tenant en creación
            UserProfile.objects.create(
                user=user,
                role=target_role,
            )
        return Response(_serialize_user(user), status=status.HTTP_201_CREATED)


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        # Solo administradores pueden ver detalle de empleados; restringido al mismo tenant
        if _get_user_role(request.user) != 'admin':
            return Response({'detail': 'Solo administradores pueden ver usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        target = User.objects.filter(id=user_id).select_related('profile').first()
        if not target:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if _get_user_role(target) != 'employee':
            return Response({'detail': 'Solo se puede consultar detalle de empleados.'}, status=status.HTTP_403_FORBIDDEN)
        admin_tenant = _get_user_tenant(request.user)
        target_tenant = _get_user_tenant(target)
        if target_tenant != admin_tenant:
            return Response({'detail': 'No puede consultar empleados de otro tenant.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(_serialize_user(target), status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        # Solo administradores, y solo eliminar empleados
        if _get_user_role(request.user) != 'admin':
            return Response({'detail': 'Solo administradores pueden eliminar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        target = User.objects.filter(id=user_id).first()
        if not target:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        if _get_user_role(target) != 'employee':
            return Response({'detail': 'Solo se pueden eliminar cuentas de empleados.'}, status=status.HTTP_403_FORBIDDEN)
        # Limitar a empleados del mismo tenant
        admin_tenant = _get_user_tenant(request.user)
        target_tenant = _get_user_tenant(target)
        if target_tenant != admin_tenant:
            return Response({'detail': 'No puede eliminar empleados de otro tenant.'}, status=status.HTTP_403_FORBIDDEN)
        target.delete()
        return Response({'message': 'Usuario eliminado.'}, status=status.HTTP_200_OK)

    def patch(self, request, user_id):
        # Solo administradores pueden actualizar datos de empleados; no se permite cambiar rol
        if _get_user_role(request.user) != 'admin':
            return Response({'detail': 'Solo administradores pueden actualizar usuarios.'}, status=status.HTTP_403_FORBIDDEN)
        target = User.objects.filter(id=user_id).select_related('profile').first()
        if not target:
            return Response({'detail': 'Usuario no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        # Solo se permite actualizar empleados del mismo tenant
        if _get_user_role(target) != 'employee':
            return Response({'detail': 'Solo se pueden actualizar cuentas de empleados.'}, status=status.HTTP_403_FORBIDDEN)
        admin_tenant = _get_user_tenant(request.user)
        target_tenant = _get_user_tenant(target)
        if target_tenant != admin_tenant:
            return Response({'detail': 'No puede actualizar empleados de otro tenant.'}, status=status.HTTP_403_FORBIDDEN)
        # No permitir cambiar el rol por este endpoint
        if 'role' in request.data:
            return Response({'detail': 'Cambio de rol no permitido.'}, status=status.HTTP_403_FORBIDDEN)
        # Actualizar campos básicos del usuario
        for field in ['email', 'first_name', 'last_name']:
            if field in request.data:
                setattr(target, field, request.data.get(field) or '')
        if 'password' in request.data and request.data['password']:
            target.set_password(request.data['password'])
        target.save()
        # Actualizar campos del perfil si existen
        try:
            profile = target.profile
            for pfield in ['phone', 'department', 'position']:
                if pfield in request.data:
                    setattr(profile, pfield, request.data.get(pfield))
            profile.save()
        except UserProfile.DoesNotExist:
            pass
        return Response(_serialize_user(target), status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current = request.data.get('current_password')
        new = request.data.get('new_password')
        if not current or not new:
            return Response({'detail': 'Debe indicar contraseña actual y nueva.'}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(current):
            return Response({'detail': 'La contraseña actual no es correcta.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            validate_password(new, user=user)
        except Exception as e:
            return Response({'detail': 'Contraseña nueva inválida.', 'errors': [str(err) for err in getattr(e, 'error_list', [e])]}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new)
        user.save()
        return Response({'message': 'Contraseña actualizada correctamente.'}, status=status.HTTP_200_OK)


# --- Reservas (Bookings) ---
class BookingSerializer(serializers.ModelSerializer):
    code = serializers.CharField(read_only=True)
    class Meta:
        model = Booking
        fields = [
            'id',
            'code',
            'first_name', 'first_image', 'email', 'address', 'check_in_date', 'check_out_date',
            'hotel_name', 'second_image', 'room_type', 'location', 'phone',
            'currency_code', 'room_value', 'rooms_count', 'guests_count',
            'created_at', 'updated_at'
        ]


class BookingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Solo administradores o super administradores
        role = _get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden consultar reservas.'}, status=status.HTTP_403_FORBIDDEN)

        ensure_tenant_for_user(request.user)
        tenant = _get_user_tenant(request.user)
        qs = Booking.objects.filter(tenant=tenant)

        # Búsqueda
        q = request.query_params.get('q')
        if q:
            qs = qs.filter(
                models.Q(first_name__icontains=q) |
                models.Q(hotel_name__icontains=q) |
                models.Q(email__icontains=q) |
                models.Q(location__icontains=q)
            )

        # Ordenamiento seguro
        ordering = request.query_params.get('ordering')
        allowed = {'first_name','hotel_name','check_in_date','check_out_date','room_value','rooms_count','guests_count','created_at'}
        if ordering:
            ord_field = ordering.lstrip('-')
            if ord_field in allowed:
                qs = qs.order_by(ordering)

        # Paginación simple
        try:
            page = int(request.query_params.get('page', '1'))
            page_size = int(request.query_params.get('page_size', '20'))
        except ValueError:
            page = 1
            page_size = 20
        total = qs.count()
        start = (page - 1) * page_size
        end = start + page_size
        data = BookingSerializer(qs[start:end], many=True).data
        return Response({'total': total, 'page': page, 'page_size': page_size, 'results': data}, status=status.HTTP_200_OK)

    def post(self, request):
        # Permitir a empleados crear reservas además de administradores y super administradores
        role = _get_user_role(request.user)
        if role not in ('admin', 'super_admin', 'employee'):
            return Response({'detail': 'No tiene permisos para crear reservas.'}, status=status.HTTP_403_FORBIDDEN)

        ensure_tenant_for_user(request.user)
        tenant = _get_user_tenant(request.user)

        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            booking = serializer.save(tenant=tenant, created_by=request.user)
            return Response(BookingSerializer(booking).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, request, booking_id):
        ensure_tenant_for_user(request.user)
        tenant = _get_user_tenant(request.user)
        return Booking.objects.filter(id=booking_id, tenant=tenant).first()

    def get(self, request, booking_id):
        if _get_user_role(request.user) not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden ver reservas.'}, status=status.HTTP_403_FORBIDDEN)
        booking = self.get_object(request, booking_id)
        if not booking:
            return Response({'detail': 'Reserva no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)

    def patch(self, request, booking_id):
        if _get_user_role(request.user) not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden editar reservas.'}, status=status.HTTP_403_FORBIDDEN)
        booking = self.get_object(request, booking_id)
        if not booking:
            return Response({'detail': 'Reserva no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = BookingSerializer(instance=booking, data=request.data, partial=True)
        if serializer.is_valid():
            booking = serializer.save()
            return Response(BookingSerializer(booking).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, booking_id):
        if _get_user_role(request.user) not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden eliminar reservas.'}, status=status.HTTP_403_FORBIDDEN)
        booking = self.get_object(request, booking_id)
        if not booking:
            return Response({'detail': 'Reserva no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        booking.delete()
        return Response({'message': 'Reserva eliminada.'}, status=status.HTTP_200_OK)


class BookingByCodePublicView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({'detail': 'Código es requerido.'}, status=status.HTTP_400_BAD_REQUEST)
        code = code.strip().upper()
        booking = Booking.objects.filter(code=code).first()
        if not booking:
            return Response({'detail': 'Reserva no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        data = BookingSerializer(booking).data
        return Response(data, status=status.HTTP_200_OK)


class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = _get_user_role(request.user)
        if role not in ('admin', 'super_admin'):
            return Response({'detail': 'Solo administradores pueden consultar estadísticas.'}, status=status.HTTP_403_FORBIDDEN)
        ensure_tenant_for_user(request.user)
        tenant = _get_user_tenant(request.user)
        total_bookings = Booking.objects.filter(tenant=tenant).count()
        total_employees = User.objects.filter(profile__role='employee', profile__tenant=tenant).count()
        total_admins = User.objects.filter(profile__role='admin').count()
        # Asumimos que cada reserva genera un recibo
        total_receipts = total_bookings
        return Response({
            'total_bookings': total_bookings,
            'total_receipts': total_receipts,
            'total_employees': total_employees,
            'total_admins': total_admins,
        }, status=status.HTTP_200_OK)


class BookingReceiptEmailView(APIView):
    permission_classes = [AllowAny]

    def render_to_pdf(self, template_src, context_dict):
        try:
            html = render_to_string(template_src, context_dict)
            result = BytesIO()
            pdf = pisa.pisaDocument(BytesIO(html.encode("UTF-8")), result)
            if not pdf.err:
                return result.getvalue()
            return None
        except Exception as e:
            print(f"Error generating PDF for {template_src}: {e}")
            return None

    def post(self, request, booking_id):
        booking = Booking.objects.filter(id=booking_id).first()
        if not booking:
            return Response({'detail': 'Reserva no encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        # Prepare email
        subject = f'Confirmación y Recibo de Reserva - {booking.code}'
        from_email = settings.DEFAULT_FROM_EMAIL
        to_email = booking.email
        
        if not to_email:
            return Response({'detail': 'La reserva no tiene un email asociado.'}, status=status.HTTP_400_BAD_REQUEST)

        receipt_file = request.FILES.get('receipt_pdf')
        reservation_file = request.FILES.get('reservation_pdf')
        if not receipt_file and not reservation_file:
            return Response({'detail': 'Debe adjuntar los PDFs generados desde el dashboard.'}, status=status.HTTP_400_BAD_REQUEST)

        html_content = f"""
        <div style="font-family:Arial,Helvetica,sans-serif;background:#0ea5e9;background:linear-gradient(90deg,#0ea5e9,#6366f1);padding:20px;color:white;">
          <div style="max-width:640px;margin:0 auto;">
            <h1 style="margin:0 0 8px 0;">Tu reserva está lista</h1>
            <p style="margin:0 0 18px 0;opacity:0.95;">Código de confirmación <strong>{booking.code}</strong></p>
          </div>
        </div>
        <div style="max-width:640px;margin:0 auto;padding:16px 20px;background:#ffffff;border:1px solid #e5e7eb;border-top:none;">
          <p style="color:#0f172a;">Hola <strong>{booking.first_name}</strong>, adjuntamos tu <strong>reserva</strong> y tu <strong>recibo</strong> exactamente como los generaste en el dashboard.</p>
          <div style="margin-top:12px;padding:12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;">
            <div style="display:flex;justify-content:space-between;">
              <div>
                <div style="color:#64748b;font-size:12px;">Hotel</div>
                <div style="color:#0f172a;font-weight:600;">{booking.hotel_name}</div>
              </div>
              <div>
                <div style="color:#64748b;font-size:12px;">Check-in</div>
                <div style="color:#0f172a;font-weight:600;">{booking.check_in_date}</div>
              </div>
              <div>
                <div style="color:#64748b;font-size:12px;">Check-out</div>
                <div style="color:#0f172a;font-weight:600;">{booking.check_out_date}</div>
              </div>
            </div>
          </div>
          <p style="color:#334155;margin-top:12px;">Gracias por confiar en GlobeTrek.</p>
        </div>
        """
        text_content = f"Adjuntamos los PDF de tu reserva y recibo ({booking.code})."

        msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")

        if receipt_file:
            msg.attach(f"Recibo_{booking.code}.pdf", receipt_file.read(), 'application/pdf')
        if reservation_file:
            msg.attach(f"Reserva_{booking.code}.pdf", reservation_file.read(), 'application/pdf')

        try:
            msg.send()
            return Response({'message': 'Enviado correctamente.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'detail': f'Error al enviar el correo: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
