
import requests


#  python poster.py

if __name__ == '__main__':

    url = "http://127.0.0.1:8000/simulated/start-scheduler"
    url2 = "http://127.0.0.1:8000/reset-scheduler"
    url3 = "http://127.0.0.1:8000/prueba"
    data = {
        "session_id": "simulated_test1234",
        "flight_id": "668e41ee3f23ded5fecd6cd3",
        "dep_code": "ORD",
        "arr_code": "SFO",
        "dep_loc": [41.878113, -87.629799],
        "arr_loc": [37.774929, -122.419418]
    }
    data3 = {'field' : 'Comprobación', 'otro_field' : 'Mensaje2'}

    i = input("Start(1) or stop(2) ? : ")
    if i == "1":
        response = requests.post(url, json=data)
    elif i == "2":
        response2 = requests.get(url2+"/simulated_test1234")
    elif i == "3":
        response = requests.post(url3, json=data3)
    else:
        print("Invalid option")