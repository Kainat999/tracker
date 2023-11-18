from rest_framework import serializers
from .models import TrackerRecord

class TrackerRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackerRecord
        fields = ['id', 'user', 'start_time', 'end_time']
