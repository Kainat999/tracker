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
from datetime import timedelta
from rest_framework.views import APIView
from django.db.models import Sum
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from time import timezone
from datetime import date






class RegisterView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return JsonResponse({'error': 'Please provide both username and password'}, status=400)

        user = User.objects.create_user(username=username, password=password)
        Profile.objects.create(user=user)

        return JsonResponse({'message': 'Registration successful'})





# def register(request):
#     username = request.data.get('username')
#     password = request.data.get('password')

#     if not username or not password:
#         return JsonResponse({'error': 'Please provide both username and password'}, status=400)

#     user = User.objects.create_user(username=username, password=password)
#     Profile.objects.create(user=user)

#     return JsonResponse({'message': 'Registration successful'})










class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            token = SlidingToken.for_user(user)
            return Response({'token': str(token), 'message': 'Login successful'})
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)



# def login_view(request):
#     username = request.data.get('username')
#     password = request.data.get('password')

#     user = authenticate(request, username=username, password=password)

#     if user is not None:
#         token = SlidingToken.for_user(user)
#         return Response({'token': str(token), 'message': 'Login successful'})
#     else:
#         return JsonResponse({'error': 'Invalid credentials'}, status=401)




class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    def get(self, request):
        user = request.user
        time_period = request.query_params.get('time_period')
        queryset = TrackerRecord.objects.filter(user=user)
        if time_period == 'day':
            # this is records of day
            today = timezone.now().date()
            queryset = queryset.filter(start_time__date=today)
            # this is for week ... weekly records
        elif time_period == 'week':
            queryset = queryset.annotate(date=TruncWeek('start_time')).values('date').annotate(total_time=Sum('end_time')-Sum('start_time'))
            #  this is for monthly records 
        elif time_period == 'month':

            queryset =  queryset.annotate(date=TruncMonth('start_time')).values('date').annotate(total_time=Sum('end_time')-Sum('start_time'))


        records = queryset.order_by('-start_time')
    
        elapsedTimeChunks = []
        for record in records:
            if record.end_time:
                elapsedTimeChunks.append(record.end_time - record.start_time)
        
        serializer = TrackerRecordSerializer(records, many=True)



        user_data = {
            'id': user.id,
            'username': user.username,
        }


        response_data = {
            'user': user_data,
            'records': serializer.data,
            'elapsedTimeChunks': [str(chunk) for chunk in elapsedTimeChunks],  
        }

        return Response(response_data)
        
    def post(self, request):
        serializer = TrackerRecordSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        return Response(status=status.HTTP_204_NO_CONTENT)



# def dashboard(request):
#     if request.method == 'GET':
#         user = request.user
#         records = TrackerRecord.objects.filter(user=user).order_by('-start_time')
        
        # elapsedTimeChunks = []
        # for record in records:
        #     if record.end_time:
        #         elapsedTimeChunks.append(record.end_time - record.start_time)
        
        # serializer = TrackerRecordSerializer(records, many=True)



        # user_data = {
        #     'id': user.id,
        #     'username': user.username,
        # }


        # response_data = {
        #     'user': user_data,
        #     'records': serializer.data,
        #     'elapsedTimeChunks': [str(chunk) for chunk in elapsedTimeChunks],  
        # }

        # return Response(response_data)

    # elif request.method == 'POST':
        # serializer = TrackerRecordSerializer(data=request.data)
        # if serializer.is_valid():
        #     serializer.save(user=request.user)
        #     return Response(serializer.data, status=status.HTTP_201_CREATED)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    # elif request.method == 'DELETE':
    #     return Response(status=status.HTTP_204_NO_CONTENT)
