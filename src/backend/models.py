class Ticket:
    def __init__(self, id, attendee_id, event_id, qr_code):
        self.id = id
        self.attendee_id = attendee_id
        self.event_id = event_id
        self.qr_code = qr_code
        
class Organization:
    def __init__(self, id, title, description, status):
        self.id = id
        self.title = title
        self.description = description
        self.status = status
        
class Organization_Member:
    def __init__(self, id, title):
        self.id = id
        self.title = title