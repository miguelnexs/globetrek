from django.db import migrations, models
import django.core.validators


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0006_booking_code'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='currency_code',
            field=models.CharField(
                default='EUR',
                max_length=3,
                validators=[
                    django.core.validators.RegexValidator(
                        regex='^[A-Z]{3}$',
                        message='Moneda debe ser código ISO de 3 letras (p.ej., EUR, USD).'
                    )
                ],
            ),
        ),
    ]
