import os
import time

from django.core.files.storage import default_storage


def is_remote_media_reference(value):
    return isinstance(value, str) and (value.startswith("http") or "/" in value)


def save_media_file(file_obj, folder):
    filename = f"{folder}/{file_obj.name}"
    if default_storage.exists(filename):
        base, ext = os.path.splitext(file_obj.name)
        filename = f"{folder}/{base}_{int(time.time())}{ext}"
    return default_storage.save(filename, file_obj)


def save_media_or_url(serializer, request, field_name, folder, extra_kwargs=None):
    file_obj = request.FILES.get(field_name)
    kwargs = dict(extra_kwargs) if extra_kwargs else {}

    if file_obj:
        kwargs[field_name] = save_media_file(file_obj, folder)
    else:
        url_value = request.data.get(field_name)
        if is_remote_media_reference(url_value):
            kwargs[field_name] = url_value

    serializer.save(**kwargs)
