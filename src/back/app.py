from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import create_access_token
from flask_jwt_extended import JWTManager
import psycopg2
from psycopg2 import OperationalError
import bcrypt
import boto3
from werkzeug.utils import secure_filename
import os

app = Flask(__name__)
CORS(app)
jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = 'your_secret_key_here'

# Параметры доступа к S3
bucket_url = 'https://s3.timeweb.cloud'
access_key = 'VVFE6PSSQPVW19Z654LA'
secret_key = 'TzswIbLFQX1B8gktU8lgrxfOYXAIrdG5s4gB1mbY'
bucket_name = 'f8227d6f-1ac14f84-99ef-4e5f-80e3-92250408b33e'

# Создание клиента S3
s3 = boto3.client(
    's3', 
    aws_access_key_id=access_key, 
    aws_secret_access_key=secret_key,
    endpoint_url=bucket_url,
    )

# Загрузка файла в бакет S3
def upload_file_to_s3(file, s3_key):
    try:
        s3.upload_fileobj(file.stream, bucket_name, s3_key)
        print("Файл успешно загружен в S3")
        return True
    except Exception as e:
        print(f"Ошибка загрузки файла в S3: {e}")
        return False

# Подключение к базе данных PostgreSQL
conn = psycopg2.connect(
    host="82.97.255.161",
    database="default_db",
    user="gen_user",
    password="u{NH6Qlu|o3(Gg",
    options='-c search_path=public'
)

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response



@app.route('/api/save-user', methods=['POST'])
def save_user():
    data = request.json

    # Проверка наличия требуемых полей
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing fields'}), 400
    
    print("Data to insert:", data)

    # Сохранение пользователя в базе данных
    cur = conn.cursor()
    if data['userType'] == True:
        cur.execute("INSERT INTO zakazchik (login, last_name, first_name, patronymic, email, password) VALUES (%s, %s, %s, %s, %s, %s)",
                (data['login'], data['last_name'], data['first_name'], data['patronymic'], data['email'], data['password']))
        conn.commit()
        cur.close()
    elif data['userType'] == False:
        cur.execute("INSERT INTO ispolnitel (login, last_name, first_name, patronymic, email, password) VALUES (%s, %s, %s, %s, %s, %s)",
                (data['login'], data['last_name'], data['first_name'], data['patronymic'], data['email'], data['password']))
        conn.commit()
        cur.close()
    else:
        return jsonify({'error': 'Invalid user type'}), 400
        
    conn.commit()
    cur.close()

    return jsonify({'message': 'User saved successfully'}), 200



@app.route('/api/auth-user', methods=['POST'])
def auth_user():
    data = request.json

    # Проверка наличия требуемых полей
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing fields'}), 400

    # Получение хэшированного пароля и id из базы данных для данного email
    cur = conn.cursor()
    cur.execute("SELECT id, password FROM zakazchik WHERE email = %s", (data['email'],))
    user = cur.fetchone()

    # Проверка, найден ли пользователь с таким email
    if user:
        ID_zakazchik, stored_password = user
        # Проверка пароля
        if (data['password'] == stored_password):
            cur.close()
            return jsonify({'type': 'zakazchik', 'id': ID_zakazchik}), 200
        else:
            cur.execute("SELECT id, password FROM ispolnitel WHERE email = %s", (data['email'],))
            user = cur.fetchone()

            if user:
                ID_Ispolnitel, stored_password = user
                # Проверка пароля
                if (data['password'] == stored_password):
                    cur.close()
                    return jsonify({'type': 'ispolnitel', 'id': ID_Ispolnitel}), 200
                else:
                    cur.close()
                    return jsonify({'error': 'Invalid password'}), 400
            else:
                cur.close()
                return jsonify({'error': 'Invalid email or password'}), 400
        


@app.route('/api/get-users', methods=['GET'])
def get_users():
    cur = conn.cursor()
    cur.execute("SELECT id, login, first_name FROM ispolnitel")
    users = cur.fetchall()
    cur.close()

    # Преобразование результата запроса в список словарей
    user_list = [{'id': user[0], 'login': user[1], 'first_name': user[2]} for user in users]

    return jsonify(user_list), 200



@app.route('/api/get-employeers', methods=['GET'])
def get_employeers():
    cur = conn.cursor()
    cur.execute("SELECT id, login, first_name FROM zakazchik")
    users = cur.fetchall()
    cur.close()

    # Преобразование результата запроса в список словарей
    user_list = [{'id': user[0], 'login': user[1], 'first_name': user[2]} for user in users]

    return jsonify(user_list), 200
    


@app.route('/api/get-profile', methods=['POST'])
def get_profile():
    # Получение данных из тела запроса
    access_token = request.headers.get('Authorization')
    user_type = request.form.get('user_type')

    cur = conn.cursor()
    
    # Запрос данных о клиенте
    query = f"SELECT first_name, last_name FROM {user_type} WHERE id = %s"
    cur.execute(query, access_token)
    client_data = cur.fetchone()
    if not client_data:
        return jsonify({'error': 'User not found'}), 404

    first_name, last_name = client_data

    return jsonify({
        'first_name': first_name,
        'last_name': last_name,
    }), 200



@app.route('/api/add-card', methods=['POST'])
def add_card():
    data = request.json
    # Получаем данные из запроса формы
    name = data['name']
    price = data['price']
    description = data['description']
    timer = data['timer']
    categoryName = data['categoryName']
    

    # Проверяем наличие обязательных полей
    print("Data to insert:", name, price, description, timer, categoryName)

    if not all([name, price, description, timer, categoryName]):
        return jsonify({'error': 'Missing fields'}), 400
    

    # Сохраняем пользователя в базе данных
    cur = conn.cursor()
    cur.execute("INSERT INTO zakaz (card_name, price, opisaniye, vremya, kategoria) VALUES (%s, %s, %s, %s, %s)",
            (name, price, description, timer, categoryName))
    conn.commit()
    cur.close()

    return jsonify({'message': 'Card saved successfully'}), 200



@app.route('/api/get-cards', methods=['GET'])
def get_cards():
    try:
        cur = conn.cursor()

        # Проверяем, открыта ли текущая транзакция
        if not conn.isolation_level:
            conn.rollback()

        cur.execute("SELECT id, price, opisaniye, vremya, kategoria, card_name FROM zakaz WHERE idispolnitel IS NULL")
        cards = cur.fetchall()
        cur.close()

        card_list = [{'id': card[0], 'price': card[1], 'description': card[2], 'timer': card[3], 'categoryname': card[4], 'card_name': card[5]} for card in cards]

        return jsonify(card_list), 200
    except OperationalError as e:
        return jsonify({"error": str(e)}), 500



@app.route('/api/add-contest', methods=['POST'])
def add_contest():
    data = request.json
    # Получаем данные из запроса формы
    name = data['name']
    price = data['price']
    description = data['description']
    timer = data['timer']
    categoryName = data['categoryName']
    

    # Проверяем наличие обязательных полей
    print("Data to insert:", name, price, description, timer, categoryName)

    if not all([name, price, description, timer, categoryName]):
        return jsonify({'error': 'Missing fields'}), 400
    

    # Сохраняем пользователя в базе данных
    cur = conn.cursor()
    cur.execute("INSERT INTO konkurs (cards, price, opisaniye, vremya, kategoria) VALUES (%s, %s, %s, %s, %s)",
            (name, price, description, timer, categoryName))
    conn.commit()
    cur.close()

    return jsonify({'message': 'Card saved successfully'}), 200



@app.route('/api/get-contest', methods=['GET'])
def get_contest():
    try:
        cur = conn.cursor()

        # Проверяем, открыта ли текущая транзакция
        if not conn.isolation_level:
            conn.rollback()

        cur.execute("SELECT id, price, opisaniye, vremya, kategoria, cards FROM konkurs WHERE idispolnitel IS NULL")
        cards = cur.fetchall()
        cur.close()

        card_list = [{'id': card[0], 'price': card[1], 'description': card[2], 'timer': card[3], 'categoryname': card[4], 'cards': card[5]} for card in cards]

        return jsonify(card_list), 200
    except OperationalError as e:
        return jsonify({"error": str(e)}), 500
        


@app.route('/api/delete-card/<int:card_id>', methods=['DELETE'])
def delete_card(card_id):
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM zakaz WHERE id = %s", (card_id,))
        conn.commit()
        cur.close()
        return jsonify({"message": "Card deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/api/delete-comp/<int:card_id>', methods=['DELETE'])
def delete_comp(card_id):
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM konkurs WHERE id = %s", (card_id,))
        conn.commit()
        cur.close()
        return jsonify({"message": "Card deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route('/api/add-to-me', methods=['POST'])
def add_to_me():
    # Получаем id выбранной карточки из тела запроса
    card_id = request.json.get('card_id')

    if not card_id:
        return jsonify({'error': 'Card id not provided'}), 400

    # Получаем токен авторизации из заголовков запроса
    authorization_token = request.headers.get('Authorization')

    cur = conn.cursor()
    cur.execute("UPDATE zakaz SET idispolnitel = %s WHERE id = %s", (authorization_token, card_id))
    conn.commit()
    cur.close()

    return jsonify({'message': 'Card added successfully'}), 200



@app.route('/api/get-user-cards', methods=['GET'])
def get_user_cards():
    # Получаем токен авторизации из заголовков запроса
    authorization_token = request.headers.get('Authorization')

    if not authorization_token:
        return jsonify({'error': 'Authorization token not provided'}), 401

    # Проверяем наличие пользователя с данным токеном авторизации
    cur = conn.cursor()
    cur.execute("SELECT * FROM zakaz WHERE idispolnitel = %s", (authorization_token,))
    user_cards = cur.fetchall()
    conn.commit()
    cur.close()
    # Собираем результаты в список для вывода
    user_card_list = [{'id': row[0]} for row in user_cards]

    return jsonify({'user_cards': user_card_list}), 200



@app.route('/api/get-card', methods=['GET'])
def get_card():
    # Получаем id карточки из параметров запроса
    card_id = request.args.get('id')

    if not card_id:
        return jsonify({'error': 'Card id not provided'}), 400

    # Выполняем запрос к таблице cards
    cur = conn.cursor()
    cur.execute("SELECT * FROM zakaz WHERE id = %s", (card_id,))
    card_data = cur.fetchone()

    if not card_data:
        return jsonify({'error': 'Card not found'}), 404

    # Формируем JSON-ответ с данными карточки
    card = {
        'id': card_data[0],
        'card_name': card_data[6],
        'opisaniye': card_data[3],
        'price': card_data[2],
        'vremya': card_data[4],
        'kategoria': card_data[5]
        # Добавьте другие поля, если необходимо
    }

    return jsonify({'card': card}), 200



@app.route('/api/add-to-me-comp', methods=['POST'])
def add_to_me_comp():
    # Получаем id выбранной карточки из тела запроса
    card_id = request.json.get('card_id')

    if not card_id:
        return jsonify({'error': 'Card id not provided'}), 400

    # Получаем токен авторизации из заголовков запроса
    authorization_token = request.headers.get('Authorization')

    # Проверяем наличие пользователя с данным токеном авторизации
    cur = conn.cursor()
    # Здесь выполняется добавление выбранной карточки к пользователю с указанным id
    # Например:
    cur.execute("UPDATE konkurs SET idispolnitel = %s WHERE id = %s", (authorization_token, card_id))
    conn.commit()
    cur.close()

    return jsonify({'message': 'Card added successfully'}), 200


if __name__ == "__main__":
    app.run(debug=True)