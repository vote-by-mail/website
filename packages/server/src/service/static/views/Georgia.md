{% extends "LetterBase.md" %}

{% set guidance = 'the [Georgia Secretary of State](https://sos.ga.gov/admin/uploads/Absentee_Voting_Guide_20142.pdf)' %}

{% block body %}
{%- if phone -%}
- Phone: **{{phone}}**
{%- endif %}
- County: **{{county}}**
- Election: **{{election}}**
{%- if party -%}
- Party: **{{party}}**
{%- endif %}

{% endblock %}
