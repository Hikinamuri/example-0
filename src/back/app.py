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
    host="147.45.138.94",
    database="default_db",
    user="gen_user",
    password="?{,xy%m3)beqov"
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
    hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt(rounds=12))

    # Сохранение пользователя в базе данных
    cur = conn.cursor()
    cur.execute("INSERT INTO clients (login, last_name, first_name, patronymic, email, password, type, work_type) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)",
            (data['login'], data['last_name'], data['first_name'], data['patronymic'], data['email'], hashed_password, data['userType'], data['categoryName']))

    conn.commit()
    cur.close()

    return jsonify({'message': 'User saved successfully'}), 200



@app.route('/api/auth-user', methods=['POST'])
def auth_user():
    data = request.json

    # Проверка наличия требуемых полей
    if 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing fields'}), 400

    # Получение хэшированного пароля из базы данных для данного email
    cur = conn.cursor()
    cur.execute("SELECT password FROM clients WHERE email = %s", (data['email'],))
    stored_password = cur.fetchone()

    print (stored_password)

    # Проверка, найден ли пользователь с таким email
    if stored_password:
        # Сравнение введенного пользователем пароля с хэшированным паролем из базы данных
        if bcrypt.checkpw(data['password'].encode('utf-8'), stored_password[0].tobytes()):
            access_token = create_access_token(identity=data['email'])
            cur.execute("UPDATE clients SET token = %s WHERE email = %s", (access_token, data['email']))
            if 'email' in data and isinstance(data['email'], str):
                cur.execute("SELECT type FROM clients WHERE email = %s", (data['email'],))
                userType = cur.fetchone()[0]
            else:
                return jsonify({'error': 'Invalid email format'}), 400
            conn.commit()
            cur.close()
            return jsonify({'access_token': access_token, 'userType': userType}), 200
        else:
            return jsonify({'error': 'Authentication failed'}), 401
    else:
        return jsonify({'error': 'Authentication failed'}), 401



@app.route('/api/get-users', methods=['GET'])
def get_users():
    cur = conn.cursor()
    cur.execute("SELECT id, login, first_name, work_type, profile_photo FROM clients WHERE type = false")
    users = cur.fetchall()
    cur.close()

    # Преобразование результата запроса в список словарей
    user_list = [{'id': user[0], 'login': user[1], 'first_name': user[2], 'work_type': user[3], 'profile_photo': user[4]} for user in users]

    return jsonify(user_list), 200



@app.route('/api/get-employeers', methods=['GET'])
def get_employeers():
    cur = conn.cursor()
    cur.execute("SELECT id, login, first_name, work_type, profile_photo FROM clients WHERE type = true")
    users = cur.fetchall()
    cur.close()

    # Преобразование результата запроса в список словарей
    user_list = [{'id': user[0], 'login': user[1], 'first_name': user[2], 'work_type': user[3], 'profile_photo': user[4]} for user in users]

    return jsonify(user_list), 200



@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['image']
    headers = request.headers

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        filename = secure_filename(file.filename)
        cur = conn.cursor()
        cur.execute("SELECT id FROM clients WHERE token = %s", (headers['Authorization'],))
        print(headers['Authorization'])
        result = cur.fetchone()
        if result:
            userId = result[0]
            s3_key = f"uploads/{userId}/{filename}"
            if upload_file_to_s3(file, s3_key):
                cur.execute("UPDATE clients SET profile_photo = %s WHERE token = %s", (f'https://f8227d6f-1ac14f84-99ef-4e5f-80e3-92250408b33e.s3.timeweb.cloud/uploads/{userId}/{filename}', headers['Authorization']))
                conn.commit()
                return jsonify({'message': 'Image uploaded successfully', 'filename': f'https://s3.timeweb.cloud/f8227d6f-1ac14f84-99ef-4e5f-80e3-92250408b33e/uploads/{userId}/{filename}'}), 200
            else:
                return jsonify({'error': 'Failed to upload image to S3'}), 500
        else:
            return jsonify({'error': 'User not found'}), 404



@app.route('/api/get-image', methods=['POST'])
def get_image():
    headers = request.headers
    cur = conn.cursor()
    cur.execute("SELECT profile_photo FROM clients WHERE token = %s", (headers['Authorization'],))
    profile_photo = cur.fetchone()[0]

    if profile_photo: 
        return jsonify({'message': profile_photo}), 200
    else: 
        return jsonify({'error': 'Failed to upload image to S3'}), 500
    


@app.route('/api/get-profile', methods=['POST'])
def get_profile():
    headers = request.headers
    cur = conn.cursor()

    # Запрос данных о клиенте
    cur.execute("SELECT first_name, last_name, work_type, taken_cards FROM clients WHERE token = %s", (headers['Authorization'],))
    client_data = cur.fetchone()
    if not client_data:
        return jsonify({'error': 'User not found'}), 404

    first_name, last_name, work_type, taken_cards = client_data

    return jsonify({
        'first_name': first_name,
        'last_name': last_name,
        'work_type': work_type,
        'taken_cards': taken_cards
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
    cur.execute("INSERT INTO cards (card_name, price, description, timer, categoryname) VALUES (%s, %s, %s, %s, %s)",
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

        cur.execute("SELECT id, price, description, timer, categoryname, card_name FROM cards WHERE in_works = false")
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
    cur.execute("INSERT INTO competitions (cards, price, description, timer, categoryname, in_works) VALUES (%s, %s, %s, %s, %s, %s)",
            (name, price, description, timer, categoryName, 'false'))
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

        cur.execute("SELECT id, price, description, timer, categoryname, cards FROM competitions WHERE in_works = false")
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
        cur.execute("DELETE FROM cards WHERE id = %s", (card_id,))
        conn.commit()
        cur.close()
        return jsonify({"message": "Card deleted successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    


@app.route('/api/delete-comp/<int:card_id>', methods=['DELETE'])
def delete_comp(card_id):
    try:
        cur = conn.cursor()
        cur.execute("DELETE FROM competitions WHERE id = %s", (card_id,))
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

    if not authorization_token:
        return jsonify({'error': 'Authorization token not provided'}), 401

    # Проверяем наличие пользователя с данным токеном авторизации
    cur = conn.cursor()
    cur.execute("SELECT id FROM clients WHERE token = %s", (authorization_token,))
    user_result = cur.fetchone()

    if not user_result:
        return jsonify({'error': 'User not found'}), 404

    user_id = user_result[0]

    # Здесь выполняется добавление выбранной карточки к пользователю с указанным id
    # Например:
    cur.execute("INSERT INTO user_cards (user_id, card_id) VALUES (%s, %s)", (user_id, card_id))
    cur.execute("UPDATE cards SET in_works = true WHERE id = %s", (card_id,))
    conn.commit()

    return jsonify({'message': 'Card added successfully'}), 200



@app.route('/api/add-to-me-comp', methods=['POST'])
def add_to_me_comp():
    # Получаем id выбранной карточки из тела запроса
    card_id = request.json.get('card_id')

    if not card_id:
        return jsonify({'error': 'Card id not provided'}), 400

    # Получаем токен авторизации из заголовков запроса
    authorization_token = request.headers.get('Authorization')

    if not authorization_token:
        return jsonify({'error': 'Authorization token not provided'}), 401

    # Проверяем наличие пользователя с данным токеном авторизации
    cur = conn.cursor()
    cur.execute("SELECT id FROM clients WHERE token = %s", (authorization_token,))
    user_result = cur.fetchone()

    if not user_result:
        return jsonify({'error': 'User not found'}), 404

    user_id = user_result[0]

    # Здесь выполняется добавление выбранной карточки к пользователю с указанным id
    # Например:
    cur.execute("INSERT INTO user_competitions (user_id, card_id) VALUES (%s, %s)", (user_id, card_id))
    cur.execute("UPDATE competitions SET in_works = true WHERE id = %s", (card_id,))
    conn.commit()

    return jsonify({'message': 'Card added successfully'}), 200


if __name__ == "__main__":
    app.run(debug=True)