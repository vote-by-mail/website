{% extends "LetterBase.md" %}

{% set guidance = 'the [recent changes in New York State law](https://www.governor.ny.gov/news/governor-cuomo-signs-law-sweeping-election-reforms)' %}

{% block body %}
- County: **{{county}}**
- Reason: "temporary illness or physical disability" due to the risk of contracting COVID-19.
- Elections: generally, all elections through the end of the calendar year; in particular, **{{election}}**..

{% endblock %}

