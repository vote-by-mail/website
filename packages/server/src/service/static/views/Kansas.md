{% extends "Base.md" %}
{% from "Image.md" import image %}

{% set guidance = 'the [Office of the Kansas Secretary Of State](https://sos.ks.gov/elections/voter-information.html)' %}

{% block text %}
The signed application form is attached.
{% endblock %}
{%- if idPhoto -%}
- Photo of ID (see attached)
{{image(idPhoto)}}
{%- endif %}
