from django.db import models
import random
import string
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .utils.crypto import encrypt_text, is_encrypted_text

# Definición de roles
ROLE_CHOICES = (
    ('super_admin', 'Super Administrador'),
    ('admin', 'Administrador'),
    ('employer', 'Empleador'),
    ('employee', 'Empleado'),
)

class Tenant(models.Model):
    admin = models.OneToOneField(User, on_delete=models.CASCADE, related_name='tenant')
    db_alias = models.CharField(max_length=64, unique=True)
    db_path = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"Tenant({self.admin.username})"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL, related_name='users')
    # Datos sensibles cifrados en reposo (almacenados como texto cifrado)
    phone = models.CharField(max_length=255, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    
    # Validador para cédula (formato numérico)
    cedula_validator = RegexValidator(
        regex=r'^\d{8,12}$',
        message='La cédula debe contener entre 8 y 12 dígitos numéricos.'
    )
    cedula = models.CharField(
        max_length=12, 
        validators=[cedula_validator],
        unique=True,
        null=True,
        blank=True,
        verbose_name='Número de Cédula'
    )
    
    # Campos adicionales para empleados
    position = models.CharField(max_length=100, blank=True, null=True, verbose_name='Cargo')
    department = models.CharField(max_length=100, blank=True, null=True, verbose_name='Departamento')
    hire_date = models.DateField(null=True, blank=True, verbose_name='Fecha de contratación')

    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    def is_super_admin(self):
        return self.role == 'super_admin'
    
    def is_admin(self):
        return self.role == 'admin' or self.role == 'super_admin'
    
    def is_employee(self):
        return self.role == 'employee'

    def save(self, *args, **kwargs):
        # Cifrar campos sensibles si no están cifrados ya
        if self.phone and not is_encrypted_text(self.phone):
            self.phone = encrypt_text(self.phone)
        if self.address and not is_encrypted_text(self.address):
            self.address = encrypt_text(self.address)
        super().save(*args, **kwargs)


class PrivateNote(models.Model):
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Note({self.author.username})"


class Booking(models.Model):
    code = models.CharField(
        max_length=7,
        unique=True,
        db_index=True,
        validators=[RegexValidator(regex=r'^[A-Z]{5}\d{1,2}$', message='Código debe tener 5 letras mayúsculas seguidas de 1 o 2 dígitos.')]
    )
    # Sección 1
    first_name = models.CharField(max_length=150)
    first_image = models.ImageField(upload_to='bookings/', null=True, blank=True)
    email = models.EmailField()
    address = models.CharField(max_length=255)
    check_in_date = models.DateField()
    check_out_date = models.DateField()

    # Sección 2
    hotel_name = models.CharField(max_length=255)
    second_image = models.ImageField(upload_to='bookings/', null=True, blank=True)
    room_type = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, validators=[RegexValidator(regex=r'^\+?\d{7,15}$', message='Teléfono debe ser numérico (7-15 dígitos).')])

    # Sección 3
    currency_code = models.CharField(max_length=3, default='EUR', validators=[RegexValidator(regex=r'^[A-Z]{3}$', message='Moneda debe ser código ISO de 3 letras (p.ej., EUR, USD).')])
    room_value = models.DecimalField(max_digits=10, decimal_places=2)
    rooms_count = models.PositiveIntegerField()
    guests_count = models.PositiveIntegerField()

    # Multi-tenant y trazabilidad
    tenant = models.ForeignKey(Tenant, null=True, blank=True, on_delete=models.SET_NULL, related_name='bookings')
    created_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='created_bookings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Booking({self.code} - {self.first_name} - {self.hotel_name})"

    @staticmethod
    def _generate_code():
        letters = ''.join(random.choices(string.ascii_uppercase, k=5))
        digits_len = random.choice([1, 2])
        digits = ''.join(random.choices('0123456789', k=digits_len))
        return f"{letters}{digits}"

    def save(self, *args, **kwargs):
        # Generar código único automáticamente si no existe
        if not self.code:
            attempt = 0
            self.code = Booking._generate_code()
            while Booking.objects.filter(code=self.code).exists():
                self.code = Booking._generate_code()
                attempt += 1
                if attempt > 20:
                    # En el improbable caso de colisiones repetidas, forzamos 2 dígitos
                    letters = ''.join(random.choices(string.ascii_uppercase, k=5))
                    digits = ''.join(random.choices('0123456789', k=2))
                    self.code = f"{letters}{digits}"
                    if not Booking.objects.filter(code=self.code).exists():
                        break
        super().save(*args, **kwargs)
