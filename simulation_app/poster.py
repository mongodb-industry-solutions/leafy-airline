
import requests

if __name__ == '__main__':

    url = "http://127.0.0.1:8000/start-scheduler"
    url2 = "http://127.0.0.1:8000/stop-scheduler"
    url3 = "http://127.0.0.1:8000/prueba"
    data = {'flight_id' : 'ABC1234', 'dep_code': 'MAD' , 'arr_code' : 'VAL' ,  'dep_loc' : (40.471926, -3.56264), 'arr_loc' : (39.4699, -0.3763)}
    data3 = {'field' : 'Comprobación', 'otro_field' : 'Mensaje2'}

    i = input("Start(1) or stop(2) ? : ")
    if i == "1":
        response = requests.post(url, json=data)
    elif i == "2":
        response2 = requests.get(url2)
    elif i == "3":
        response = requests.post(url3, json=data3)