DROP TABLE IF EXISTS news_corona;

CREATE TABLE news_corona(
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    auther VARCHAR(255),
    img_url VARCHAR(255),
    description TEXT
);