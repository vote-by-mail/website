{% extends "LetterBase.md" %}

{% set guidance = 'the [Michigan Secretary of State](https://www.michigan.gov/sos/0,4670,7-127-1633_8716_8728-21037--,00.html)' %}

{% block body %}

{%- if phone -%}
- Phone: **{{phone}}**
{%- endif %}
- City or Township: **{{city}}**
- County: **{{county}}**
- Election: generally, all elections through the end of the calendar year; in particular, **{{election}}**
{%- if permanentList -%}
- Permanent List: Automatically send me an application to vote absentee for all future elections.
{%- endif %}


{% endblock %}
