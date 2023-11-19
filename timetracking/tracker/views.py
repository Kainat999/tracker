from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from .models import TrackerRecord, Profile
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User
from .serializers import TrackerRecordSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import SlidingToken

@csrf_exempt
@api_view(['POST', 'GET'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return JsonResponse({'error': 'Please provide both username and password'}, status=400)

    user = User.objects.create_user(username=username, password=password)
    Profile.objects.create(user=user)

    return JsonResponse({'message': 'Registration successful'})










@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user is not None:
        token = SlidingToken.for_user(user)
        return Response({'token': str(token), 'message': 'Login successful'})
    else:
        return JsonResponse({'error': 'Invalid credentials'}, status=401)



@api_view(['GET', 'POST', 'DELETE'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def dashboard(request):
    if request.method == 'GET':
        user = request.user
        records = TrackerRecord.objects.filter(user=user).order_by('-start_time')
        serializer = TrackerRecordSerializer(records, many=True)

        user_data = {
            'id': user.id,
            'username': user.username,
        }

        response_data = {
            'user': user_data,
            'records': serializer.data,
            'elapsedTimeChunks': [],  # You can populate this based on your logic
        }

        return Response(response_data)

    elif request.method == 'POST':
        serializer = TrackerRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
