import base64
from cryptography.fernet import Fernet
from django.conf import settings
import hashlib


def _get_fernet():
    # Derivar una clave estable de SECRET_KEY
    digest = hashlib.sha256(settings.FIELD_ENCRYPTION_SECRET.encode('utf-8')).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_text(plain: str) -> str:
    f = _get_fernet()
    token = f.encrypt(plain.encode('utf-8'))
    return token.decode('utf-8')


def decrypt_text(token: str) -> str:
    f = _get_fernet()
    data = f.decrypt(token.encode('utf-8'))
    return data.decode('utf-8')


def is_encrypted_text(value: str) -> bool:
    # Fernet tokens are URL-safe base64 strings typically starting with 'gAAAA'
    try:
        base64.urlsafe_b64decode(value)
        # best-effort check; not perfect
        return value.startswith('gAAAA')
    except Exception:
        return False