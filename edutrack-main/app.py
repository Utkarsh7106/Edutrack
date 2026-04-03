from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import jwt
import bcrypt
from functools import wraps
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ============= CONFIGURATION =============
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://root:@localhost/edutrack')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'edutrack-secret-key-change-this')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'jwt-secret-key-change-this')
app.config['JWT_EXPIRATION_HOURS'] = 24

db = SQLAlchemy(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ============= MODELS =============

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # student, teacher, admin
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Student(db.Model):
    __tablename__ = 'students'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    roll = db.Column(db.String(20), unique=True, nullable=False)
    branch = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(15))
    user = db.relationship('User', backref='student')

class Teacher(db.Model):
    __tablename__ = 'teachers'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    phone = db.Column(db.String(15))
    user = db.relationship('User', backref='teacher')

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer)
    semester = db.Column(db.Integer, nullable=False)

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    student = db.relationship('Student')
    course = db.relationship('Course')

class ClassTeaching(db.Model):
    __tablename__ = 'class_teaching'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    teacher = db.relationship('Teacher')
    course = db.relationship('Course')

class Attendance(db.Model):
    __tablename__ = 'attendance'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Absent')  # Present, Absent, Leave
    marked_by = db.Column(db.Integer, db.ForeignKey('teachers.id'))
    marked_at = db.Column(db.DateTime, default=datetime.utcnow)
    student = db.relationship('Student')
    course = db.relationship('Course')
    teacher = db.relationship('Teacher')

class Result(db.Model):
    __tablename__ = 'results'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    internal = db.Column(db.Integer)
    external = db.Column(db.Integer)
    total = db.Column(db.Integer)
    grade = db.Column(db.String(2))
    uploaded_by = db.Column(db.Integer, db.ForeignKey('teachers.id'))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    student = db.relationship('Student')
    course = db.relationship('Course')

class Assignment(db.Model):
    __tablename__ = 'assignments'
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    due_date = db.Column(db.DateTime, nullable=False)
    max_grade = db.Column(db.Integer, default=100)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    teacher = db.relationship('Teacher')
    course = db.relationship('Course')

class Submission(db.Model):
    __tablename__ = 'submissions'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id'), nullable=False)
    submission_text = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='Not Submitted')  # Not Submitted, Submitted, Late, Graded
    grade = db.Column(db.Integer)
    teacher_feedback = db.Column(db.Text)
    graded_at = db.Column(db.DateTime)
    graded_by = db.Column(db.Integer, db.ForeignKey('teachers.id'))
    student = db.relationship('Student')
    assignment = db.relationship('Assignment')

class Fee(db.Model):
    __tablename__ = 'fees'
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    term = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), default='Pending')  # Pending, Paid, Overdue
    paid_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    student = db.relationship('Student')

class Notice(db.Model):
    __tablename__ = 'notices'
    id = db.Column(db.Integer, primary_key=True)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    is_broadcast = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    creator = db.relationship('User')

# ============= UTILITIES =============

def hash_password(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password, password_hash):
    try:
        return bcrypt.checkpw(password.encode(), password_hash.encode())
    except:
        return False

def generate_token(user_id, role):
    payload = {
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=app.config['JWT_EXPIRATION_HOURS'])
    }
    return jwt.encode(payload, app.config['JWT_SECRET'], algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
        return payload
    except:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        payload = verify_token(token)
        if not payload:
            return jsonify({'message': 'Invalid or expired token'}), 401
        
        return f(payload, *args, **kwargs)
    return decorated

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(payload, *args, **kwargs):
            if payload['role'] not in roles:
                return jsonify({'message': 'Access denied'}), 403
            return f(payload, *args, **kwargs)
        return decorated
    return decorator

# ============= AUTH ROUTES =============

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not all(k in data for k in ['name', 'email', 'password', 'role']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hash_password(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    
    if data['role'] == 'student':
        if not all(k in data for k in ['roll', 'branch', 'year']):
            return jsonify({'message': 'Missing student fields'}), 400
        student = Student(
            user_id=user.id,
            roll=data['roll'],
            branch=data['branch'],
            year=data['year'],
            phone=data.get('phone', '')
        )
        db.session.add(student)
        db.session.commit()
    
    elif data['role'] == 'teacher':
        teacher = Teacher(
            user_id=user.id,
            department=data.get('department', 'General'),
            phone=data.get('phone', '')
        )
        db.session.add(teacher)
        db.session.commit()
    
    token = generate_token(user.id, user.role)
    return jsonify({
        'message': 'User created successfully',
        'token': token,
        'user_id': user.id,
        'role': user.role
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not all(k in data for k in ['email', 'password']):
        return jsonify({'message': 'Missing email or password'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not verify_password(data['password'], user.password_hash):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    token = generate_token(user.id, user.role)
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user_id': user.id,
        'role': user.role,
        'name': user.name
    }), 200

@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout(payload):
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(payload):
    user = User.query.get(payload['user_id'])
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    profile = {
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'role': user.role
    }
    
    if user.role == 'student' and user.student:
        student = user.student[0] if user.student else None
        if not student:
            return jsonify({'message': 'Student not found'}), 404
        profile.update({
            'roll': student.roll,
            'branch': student.branch,
            'year': student.year,
            'phone': student.phone
    })
    
    elif user.role == 'teacher' and user.teacher:
        teacher = user.teacher[0]
        profile.update({
            'department': teacher.department,
            'phone': teacher.phone
        })
    
    return jsonify(profile), 200

# ============= STUDENT ROUTES =============

@app.route('/api/student/all', methods=['GET'])
@token_required
@role_required('student')
def student_dashboard(payload):
    user = User.query.get(payload['user_id'])
    student = user.student[0] if user.student else None
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    # Get attendance
    attendance_records = db.session.query(Attendance, Course).join(Course).filter(
        Attendance.student_id == student.id
    ).all()
    
    attendance = []
    for att, course in attendance_records:
        attendance.append({
            'subject': course.name,
            'present': 'Present' if att.status == 'Present' else 0,
            'total': 1,
            'percent': '100' if att.status == 'Present' else '0'
        })
    
    # Get results
    results_records = db.session.query(Result, Course).join(Course).filter(
        Result.student_id == student.id
    ).all()
    
    results = []
    for res, course in results_records:
        results.append({
            'subject': course.name,
            'internal': res.internal,
            'external': res.external,
            'total': res.total,
            'grade': res.grade
        })
    
    # Get assignments with submission status
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    assignments = []
    if course_ids:
        assign_records = db.session.query(Assignment, Course).join(Course).filter(
            Assignment.course_id.in_(course_ids)
        ).all()
        
        for assign, course in assign_records:
            submission = Submission.query.filter_by(
                student_id=student.id,
                assignment_id=assign.id
            ).first()
            
            assignments.append({
                'id': assign.id,
                'title': assign.title,
                'subject': course.name,
                'due': assign.due_date.strftime('%Y-%m-%d %H:%M'),
                'status': submission.status if submission else 'Pending'
            })
    
    # Get fees
    fees_records = Fee.query.filter_by(student_id=student.id).all()
    
    fees = []
    for fee in fees_records:
        fees.append({
            'term': fee.term,
            'amount': fee.amount,
            'due': fee.due_date.strftime('%Y-%m-%d'),
            'status': fee.status
        })
    
    # Get notices
    notices = Notice.query.filter_by(is_broadcast=True).order_by(Notice.created_at.desc()).limit(5).all()
    
    notices_list = [{
        'title': n.title,
        'date': n.created_at.strftime('%Y-%m-%d %H:%M') if n.created_at else ''
    } for n in notices]
    
    return jsonify({
        'profile': {
            'name': user.name,
            'email': user.email,
            'roll': student.roll,
            'branch': student.branch,
            'year': student.year,
            'phone': student.phone
        },
        'attendance': attendance if attendance else [],
        'results': results if results else [],
        'assignments': assignments if assignments else [],
        'fees': fees if fees else [],
        'notices': notices_list
    }), 200

@app.route('/api/student/attendance', methods=['GET'])
@token_required
@role_required('student')
def student_attendance(payload):
    user = User.query.get(payload['user_id'])
    student = user.student[0] if user.student else None
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    attendance_records = db.session.query(Attendance, Course).join(Course).filter(
        Attendance.student_id == student.id
    ).all()
    
    attendance = []
    for att, course in attendance_records:
        attendance.append({
            'subject': course.name,
            'present': 'Present' if att.status == 'Present' else 0,
            'total': 1,
            'percent': '100' if att.status == 'Present' else '0',
            'status': 'Safe' if att.status == 'Present' else 'Low'
        })
    
    return jsonify({'attendance': attendance}), 200

@app.route('/api/student/results', methods=['GET'])
@token_required
@role_required('student')
def student_results(payload):
    user = User.query.get(payload['user_id'])
    student = user.student[0] if user.student else None
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    results_records = db.session.query(Result, Course).join(Course).filter(
        Result.student_id == student.id
    ).all()
    
    results = []
    for res, course in results_records:
        results.append({
            'subject': course.name,
            'internal': res.internal,
            'external': res.external,
            'total': res.total,
            'grade': res.grade
        })
    
    return jsonify({'results': results}), 200

@app.route('/api/student/assignments', methods=['GET'])
@token_required
@role_required('student')
def student_assignments(payload):
    user = User.query.get(payload['user_id'])
    student = user.student[0] if user.student else None
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    enrollments = Enrollment.query.filter_by(student_id=student.id).all()
    course_ids = [e.course_id for e in enrollments]
    
    assignments = []
    if course_ids:
        assign_records = db.session.query(Assignment, Course).join(Course).filter(
            Assignment.course_id.in_(course_ids)
        ).all()
        
        for assign, course in assign_records:
            submission = Submission.query.filter_by(
                student_id=student.id,
                assignment_id=assign.id
            ).first()
            
            assignments.append({
                'id': assign.id,
                'title': assign.title,
                'subject': course.name,
                'due': assign.due_date.strftime('%Y-%m-%d %H:%M'),
                'status': submission.status if submission else 'Pending'
            })
    
    return jsonify({'assignments': assignments}), 200

@app.route('/api/student/fees', methods=['GET'])
@token_required
@role_required('student')
def student_fees(payload):
    user = User.query.get(payload['user_id'])
    student = user.student[0] if user.student else None
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    
    fees_records = Fee.query.filter_by(student_id=student.id).all()
    
    fees = []
    for fee in fees_records:
        fees.append({
            'term': fee.term,
            'amount': fee.amount,
            'due': fee.due_date.strftime('%Y-%m-%d'),
            'status': fee.status
        })
    
    return jsonify({'fees': fees}), 200

@app.route('/api/student/assignment/submit', methods=['POST'])
@token_required
@role_required('student')
def submit_assignment(payload):
    user = User.query.get(payload['user_id'])
    student = user.student[0] if user.student else None
    if not student:
        return jsonify({'message': 'Student not found'}), 404
    data = request.get_json()
    
    if not all(k in data for k in ['assignment_id', 'submission_text']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    assignment = Assignment.query.get(data['assignment_id'])
    if not assignment:
        return jsonify({'message': 'Assignment not found'}), 404
    
    submission = Submission.query.filter_by(
        student_id=student.id,
        assignment_id=data['assignment_id']
    ).first()
    
    if not submission:
        submission = Submission(
            student_id=student.id,
            assignment_id=data['assignment_id'],
            submission_text=data['submission_text'],
            submitted_at=datetime.utcnow(),
            status='Submitted'
        )
        db.session.add(submission)
    else:
        submission.submission_text = data['submission_text']
        submission.submitted_at = datetime.utcnow()
        submission.status = 'Submitted'
    
    db.session.commit()
    return jsonify({'message': 'Assignment submitted successfully'}), 201

# ============= TEACHER ROUTES =============

@app.route('/api/teacher/classes', methods=['GET'])
@token_required
@role_required('teacher')
def teacher_classes(payload):
    user = User.query.get(payload['user_id'])
    teacher = user.teacher[0] if user.teacher else None
    if not teacher:
        return jsonify({'message': 'Teacher not found'}), 404
    
    teachings = db.session.query(ClassTeaching, Course).join(Course).filter(
        ClassTeaching.teacher_id == teacher.id
    ).all()
    
    classes = []
    for teaching, course in teachings:
        classes.append({
            'id': course.id,
            'code': course.course_code,
            'name': course.name,
            'credits': course.credits,
            'semester': course.semester
        })
    
    return jsonify({'classes': classes}), 200

@app.route('/api/teacher/students/<int:course_id>', methods=['GET'])
@token_required
@role_required('teacher')
def get_class_students(payload, course_id):
    enrollments = Enrollment.query.filter_by(course_id=course_id).all()
    
    students = []
    for enrollment in enrollments:
        student = enrollment.student
        user = student.user
        students.append({
            'id': student.id,
            'name': user.name,
            'roll': student.roll,
            'email': user.email,
            'branch': student.branch,
            'year': student.year
        })
    
    return jsonify({'students': students}), 200

@app.route('/api/teacher/attendance', methods=['POST'])
@token_required
@role_required('teacher')
def mark_attendance(payload):
    user = User.query.get(payload['user_id'])
    teacher = user.teacher[0] if user.teacher else None
    if not teacher:
        return jsonify({'message': 'Teacher not found'}), 404
    data = request.get_json()
    
    if not all(k in data for k in ['student_id', 'course_id', 'date', 'status']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    attendance = Attendance.query.filter_by(
        student_id=data['student_id'],
        course_id=data['course_id'],
        date=data['date']
    ).first()
    
    if not attendance:
        attendance = Attendance(
            student_id=data['student_id'],
            course_id=data['course_id'],
            date=data['date'],
            status=data['status'],
            marked_by=teacher.id
        )
        db.session.add(attendance)
    else:
        attendance.status = data['status']
    
    db.session.commit()
    return jsonify({'message': 'Attendance marked'}), 201

@app.route('/api/teacher/results', methods=['POST'])
@token_required
@role_required('teacher')
def upload_results(payload):
    user = User.query.get(payload['user_id'])
    teacher = user.teacher[0] if user.teacher else None
    if not teacher:
        return jsonify({'message': 'Teacher not found'}), 404
    data = request.get_json()
    
    if not all(k in data for k in ['student_id', 'course_id', 'internal', 'external']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    internal = int(data['internal'])
    external = int(data['external'])
    total = internal + external
    
    # Calculate grade
    if total >= 90:
        grade = 'A+'
    elif total >= 80:
        grade = 'A'
    elif total >= 70:
        grade = 'B'
    elif total >= 60:
        grade = 'C'
    else:
        grade = 'F'
    
    result = Result.query.filter_by(
        student_id=data['student_id'],
        course_id=data['course_id']
    ).first()
    
    if not result:
        result = Result(
            student_id=data['student_id'],
            course_id=data['course_id'],
            internal=internal,
            external=external,
            total=total,
            grade=grade,
            uploaded_by=teacher.id
        )
        db.session.add(result)
    else:
        result.internal = internal
        result.external = external
        result.total = total
        result.grade = grade
    
    db.session.commit()
    return jsonify({'message': 'Results uploaded successfully'}), 201

@app.route('/api/teacher/assignment', methods=['POST'])
@token_required
@role_required('teacher')
def create_assignment(payload):
    user = User.query.get(payload['user_id'])
    teacher = user.teacher[0] if user.teacher else None
    if not teacher:
        return jsonify({'message': 'Teacher not found'}), 404
    data = request.get_json()
    
    if not all(k in data for k in ['course_id', 'title', 'due_date']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    assignment = Assignment(
        teacher_id=teacher.id,
        course_id=data['course_id'],
        title=data['title'],
        description=data.get('description', ''),
        due_date=datetime.fromisoformat(data['due_date']),
        max_grade=data.get('max_grade', 100)
    )
    db.session.add(assignment)
    db.session.commit()
    
    return jsonify({'message': 'Assignment created', 'id': assignment.id}), 201

@app.route('/api/teacher/submissions/<int:assignment_id>', methods=['GET'])
@token_required
@role_required('teacher')
def get_submissions(payload, assignment_id):
    submissions = db.session.query(Submission, Student, User).join(
        Student, Submission.student_id == Student.id
    ).join(User, Student.user_id == User.id).filter(
        Submission.assignment_id == assignment_id
    ).all()
    
    subs = []
    for sub, student, student_user in submissions:
        subs.append({
            'id': sub.id,
            'student_id': student.id,
            'student_name': student_user.name,
            'student_roll': student.roll,
            'status': sub.status,
            'submitted_at': sub.submitted_at.strftime('%Y-%m-%d %H:%M') if sub.submitted_at else None,
            'grade': sub.grade,
            'feedback': sub.teacher_feedback
        })
    
    return jsonify({'submissions': subs}), 200

@app.route('/api/teacher/assignment/grade', methods=['POST'])
@token_required
@role_required('teacher')
def grade_assignment(payload):
    user = User.query.get(payload['user_id'])
    teacher = user.teacher[0] if user.teacher else None
    if not teacher:
        return jsonify({'message': 'Teacher not found'}), 404
    data = request.get_json()
    
    if not all(k in data for k in ['submission_id', 'grade']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    submission = Submission.query.get(data['submission_id'])
    if not submission:
        return jsonify({'message': 'Submission not found'}), 404
    
    submission.grade = int(data['grade'])
    submission.teacher_feedback = data.get('feedback', '')
    submission.status = 'Graded'
    submission.graded_at = datetime.utcnow()
    submission.graded_by = teacher.id
    
    db.session.commit()
    return jsonify({'message': 'Assignment graded'}), 201

# ============= ADMIN ROUTES =============

@app.route('/api/admin/users', methods=['GET'])
@token_required
@role_required('admin')
def list_users(payload):
    users = User.query.all()
    
    users_list = []
    for user in users:
        user_data = {
            'id': user.id,
            'name': user.name,
            'email': user.email,
            'role': user.role
        }
        users_list.append(user_data)
    
    return jsonify({'users': users_list}), 200

@app.route('/api/admin/user', methods=['POST'])
@token_required
@role_required('admin')
def create_user(payload):
    data = request.get_json()
    
    if not all(k in data for k in ['name', 'email', 'password', 'role']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        password_hash=hash_password(data['password']),
        role=data['role']
    )
    db.session.add(user)
    db.session.commit()
    
    if data['role'] == 'student':
        student = Student(
            user_id=user.id,
            roll=data.get('roll', f'STU{user.id}'),
            branch=data.get('branch', 'CSE'),
            year=data.get('year', 1),
            phone=data.get('phone', '')
        )
        db.session.add(student)
        db.session.commit()
    
    elif data['role'] == 'teacher':
        teacher = Teacher(
            user_id=user.id,
            department=data.get('department', 'General'),
            phone=data.get('phone', '')
        )
        db.session.add(teacher)
        db.session.commit()
    
    return jsonify({'message': 'User created', 'id': user.id}), 201

@app.route('/api/admin/user/<int:user_id>', methods=['DELETE'])
@token_required
@role_required('admin')
def delete_user(payload, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    db.session.delete(user)
    db.session.commit()
    return jsonify({'message': 'User deleted'}), 200

@app.route('/api/admin/courses', methods=['GET'])
@token_required
@role_required('admin')
def list_courses(payload):
    courses = Course.query.all()
    
    courses_list = []
    for course in courses:
        courses_list.append({
            'id': course.id,
            'code': course.course_code,
            'name': course.name,
            'credits': course.credits,
            'semester': course.semester
        })
    
    return jsonify({'courses': courses_list}), 200

@app.route('/api/admin/course', methods=['POST'])
@token_required
@role_required('admin')
def create_course(payload):
    data = request.get_json()
    
    if not all(k in data for k in ['course_code', 'name', 'semester']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    course = Course(
        course_code=data['course_code'],
        name=data['name'],
        credits=data.get('credits', 4),
        semester=data['semester']
    )
    db.session.add(course)
    db.session.commit()
    
    return jsonify({'message': 'Course created', 'id': course.id}), 201

@app.route('/api/admin/notice', methods=['POST'])
@token_required
@role_required('admin')
def post_notice(payload):
    user = User.query.get(payload['user_id'])
    data = request.get_json()
    
    if not all(k in data for k in ['title', 'content']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    notice = Notice(
        created_by=user.id,
        title=data['title'],
        content=data['content'],
        is_broadcast=data.get('is_broadcast', True)
    )
    db.session.add(notice)
    db.session.commit()
    
    return jsonify({'message': 'Notice posted', 'id': notice.id}), 201

@app.route('/api/admin/notices', methods=['GET'])
@token_required
@role_required('admin')
def list_notices(payload):
    notices = Notice.query.order_by(Notice.created_at.desc()).all()
    
    notices_list = []
    for notice in notices:
        notices_list.append({
            'id': notice.id,
            'title': notice.title,
            'content': notice.content,
            'created_by': notice.creator.name,
            'created_at': notice.created_at.strftime('%Y-%m-%d %H:%M'),
            'is_broadcast': notice.is_broadcast
        })
    
    return jsonify({'notices': notices_list}), 200

@app.route('/api/admin/fee', methods=['POST'])
@token_required
@role_required('admin')
def create_fee(payload):
    data = request.get_json()
    
    if not all(k in data for k in ['student_id', 'term', 'amount', 'due_date']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    fee = Fee(
        student_id=data['student_id'],
        term=data['term'],
        amount=data['amount'],
        due_date=datetime.strptime(data['due_date'], '%Y-%m-%d').date(),
        status='Pending'
    )
    db.session.add(fee)
    db.session.commit()
    
    return jsonify({'message': 'Fee created', 'id': fee.id}), 201

@app.route('/api/admin/stats', methods=['GET'])
@token_required
@role_required('admin')
def get_stats(payload):
    total_users = User.query.count()
    total_students = Student.query.count()
    total_teachers = Teacher.query.count()
    total_courses = Course.query.count()
    total_notices = Notice.query.count()
    
    return jsonify({
        'total_users': total_users,
        'total_students': total_students,
        'total_teachers': total_teachers,
        'total_courses': total_courses,
        'total_notices': total_notices
    }), 200

# ============= ERROR HANDLERS =============

@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'message': 'Internal server error'}), 500

# ============= INITIALIZATION =============

@app.route('/')
def home():
    return jsonify({'message': 'EduTrack API is running'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
