deploy:
	@read -p "Enter GCloud Project ID: " project_id; \
	project_name=$$project_id; \
	gcloud functions deploy monitorSignUps --project=$$project_id
