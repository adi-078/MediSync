from Crypto.Cipher import AES
import base64
import os
from dotenv import load_dotenv

load_dotenv()

AES_KEY = os.getenv("AES_KEY").encode()  # Must be 32 bytes


def pad(data: bytes):
    while len(data) % 16 != 0:
        data += b" "
    return data


def encrypt_text(plain_text: str) -> str:
    cipher = AES.new(AES_KEY, AES.MODE_CBC)
    iv = cipher.iv
    encrypted = cipher.encrypt(pad(plain_text.encode()))
    return base64.b64encode(iv + encrypted).decode()


def decrypt_text(cipher_text: str) -> str:
    raw = base64.b64decode(cipher_text)
    iv = raw[:16]
    encrypted = raw[16:]
    cipher = AES.new(AES_KEY, AES.MODE_CBC, iv=iv)
    decrypted = cipher.decrypt(encrypted)
    return decrypted.decode().strip()