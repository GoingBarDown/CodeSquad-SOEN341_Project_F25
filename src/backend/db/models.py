from db import db

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key = True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    role = db.Column(db.String(40))

    @property
    def data(self):
        return{
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role
        }

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.Text, nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime)
    end_date = db.Column(db.DateTime)
    category = db.Column(db.Text)
    capacity = db.Column(db.Integer)
    price = db.Column(db.Float)
    link = db.Column(db.Text)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    seating = db.Column(db.Text)
    status = db.Column(db.Text)
    rating = db.Column(db.Float)

    @property
    def data(self):
        return{
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'start_date': self.start_date,
            'end_date': self.end_date,
            'category': self.category,
            'capacity': self.capacity,
            'price': self.price,
            'link': self.link,
            'organizer_id': self.organizer_id,
            'seating': self.seating,
            'status': self.status,
            'rating': self.rating
        }