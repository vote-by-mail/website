{% extends "LetterBase.md" %}

{% set guidance = 'the [New York State Board of Elections](https://www.elections.ny.gov/votingabsentee.html). [Executive Order 202.23](https://www.elections.ny.gov/Covid19ExecOrders.html#:~:text=Executive%20Order%20202.23%2C%20issued%20on,eligible%20active%20and%20inactive%20voters.) mailing allows for Absentee Ballot Applications to be emailed.' %}

{% block body %}
- County: **{{county}}**
- Reason: "temporary illness or physical disability".
- Elections: generally, all elections through the end of the calendar year; in particular, **{{election}}**..

{% endblock %}

