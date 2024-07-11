
import requests

if __name__ == '__main__':

    url = "http://127.0.0.1:8000/start-scheduler"
    url2 = "http://127.0.0.1:8000/stop-scheduler"
    data = {'flight_id' : 'ABC1234', 'dep_code': 'MAD' , 'arr_code' : 'LAX' ,  'dep_loc' : (10.0, 10.0), 'arr_loc' : (45.5, -5.5)}

    i = input("Start or stop? : ")
    if i == "1":
        response = requests.post(url, json=data)
    elif i == "2":
        response2 = requests.get(url2)