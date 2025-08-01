-- Insert initial clubs (run this after schema.sql)
INSERT INTO clubs (id, name, description, type, location, created_by) VALUES
('oucc', 'Oxford University Cycling Club', 'Premier cycling club at Oxford University offering road cycling, mountain biking, and track cycling for all levels.', 'cycling', 'Oxford, UK', NULL),
('westway', 'Westway Climbing Centre', 'London''s premier climbing facility with indoor walls, training programs, and a vibrant climbing community.', 'climbing', 'London, UK', NULL),
('uclmc', 'UCL Mountaineering Club', 'Adventure mountaineering club for UCL students exploring peaks across the UK and Alps.', 'hiking', 'London, UK', NULL),
('richmond-runners', 'Richmond Park Runners', 'Community running group meeting weekly in beautiful Richmond Park for all fitness levels.', 'running', 'Richmond, London', NULL),
('oxford-tennis', 'Oxford Tennis Society', 'Competitive and social tennis club with courts across Oxford and regular tournaments.', 'tennis', 'Oxford, UK', NULL);

-- Note: You'll need to create actual user accounts first, then update the created_by fields
-- with real user UUIDs after users sign up

-- Example of how to add a user as a manager once they sign up:
-- INSERT INTO club_memberships (club_id, user_id, role, status, approved_at) 
-- VALUES ('oucc', 'USER_UUID_HERE', 'manager', 'approved', NOW());

-- Insert some sample activities (you'll need to replace organizer_id with real user UUIDs)
-- INSERT INTO activities (title, type, date, time, location, meetup_location, max_participants, special_comments, difficulty, club_id, organizer_id) VALUES
-- ('Morning Road Ride', 'cycling', '2024-01-15', '08:00', 'Oxford Countryside', 'University Parks Main Gate', 15, 'Bring your own bike and helmet. Coffee stop included!', 'Intermediate', 'oucc', 'USER_UUID_HERE'),
-- ('Beginner Climbing Session', 'climbing', '2024-01-16', '19:00', 'Westway Climbing Centre', 'Main Reception', 8, 'All equipment provided. Perfect for beginners!', 'Beginner', 'westway', 'USER_UUID_HERE');
