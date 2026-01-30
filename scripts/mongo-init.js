// MongoDB initialization script for CityFix
// This runs when the MongoDB container starts for the first time

db = db.getSiblingDB('cityfix');

// Create collections with validation schemas
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password_hash', 'role', 'created_at'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'must be a valid email address'
        },
        password_hash: {
          bsonType: 'string',
          description: 'must be a string'
        },
        role: {
          enum: ['citizen', 'operator', 'manager', 'admin'],
          description: 'must be one of the predefined roles'
        },
        municipality_id: {
          bsonType: ['objectId', 'null'],
          description: 'reference to municipality'
        },
        created_at: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('municipalities', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'created_at'],
      properties: {
        name: {
          bsonType: 'string',
          description: 'must be a string'
        },
        location: {
          bsonType: 'object',
          properties: {
            lat: { bsonType: 'double' },
            lng: { bsonType: 'double' }
          }
        },
        admin_id: {
          bsonType: ['objectId', 'null']
        },
        created_at: {
          bsonType: 'date'
        }
      }
    }
  }
});

db.createCollection('maintenance_categories');
db.createCollection('tickets');
db.createCollection('ticket_comments');
db.createCollection('ticket_feedback');
db.createCollection('media_files');
db.createCollection('municipality_boundaries');
db.createCollection('notifications');
db.createCollection('notification_preferences');

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ municipality_id: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ created_at: -1 });

db.municipalities.createIndex({ name: 1 });
db.municipalities.createIndex({ admin_id: 1 });

db.tickets.createIndex({ municipality_id: 1 });
db.tickets.createIndex({ status: 1 });
db.tickets.createIndex({ citizen_id: 1 });
db.tickets.createIndex({ assigned_operator_id: 1 });
db.tickets.createIndex({ created_at: -1 });
db.tickets.createIndex({ 'location.coordinates': '2dsphere' });

db.ticket_comments.createIndex({ ticket_id: 1 });
db.ticket_comments.createIndex({ created_at: -1 });

db.ticket_feedback.createIndex({ ticket_id: 1 }, { unique: true });
db.ticket_feedback.createIndex({ citizen_id: 1 });

db.media_files.createIndex({ ticket_id: 1 });
db.media_files.createIndex({ uploaded_by: 1 });
db.media_files.createIndex({ upload_date: -1 });

db.municipality_boundaries.createIndex({ municipality_id: 1 }, { unique: true });

db.notifications.createIndex({ user_id: 1 });
db.notifications.createIndex({ created_at: -1 });
db.notifications.createIndex({ read: 1 });

db.notification_preferences.createIndex({ user_id: 1 }, { unique: true });

print('CityFix database initialized successfully!');
