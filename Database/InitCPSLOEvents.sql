DROP DATABASE IF EXISTS CPSLOEvents;
CREATE DATABASE CPSLOEvents;
USE CPSLOEvents;

CREATE TABLE Person (
   id INT AUTO_INCREMENT PRIMARY KEY,
   firstName VARCHAR(50),
   lastName VARCHAR(50),
   email VARCHAR(50) NOT NULL,
   password VARCHAR(50) NOT NULL,
   city VARCHAR(50),
   state VARCHAR(50), 
   zip VARCHAR(50),
   country VARCHAR(50),
   UNIQUE key(email)
);

CREATE TABLE Event (
   id INT AUTO_INCREMENT PRIMARY KEY,
   title VARCHAR(80) NOT NULL,
   orgId INT NOT NULL,
   city VARCHAR(50),
   state VARCHAR(50),
   zip VARCHAR(50),
   country VARCHAR(50),
   addr VARCHAR(50) NOT NULL,
   date DATETIME NOT NULL,
   descr VARCHAR(500),
   private BOOL,
   CONSTRAINT FKEvent_prsId FOREIGN KEY (orgId) REFERENCES Person (id)
    ON DELETE CASCADE
);

CREATE TABLE Reservation (
   id INT AUTO_INCREMENT PRIMARY KEY,
   prsId INT NOT NULL,
   evtId INT NOT NULL,
   status ENUM("Going", "Maybe", "Not Going"),
   CONSTRAINT FKReservation_prsId FOREIGN KEY (prsId) REFERENCES Person (id)
      ON DELETE CASCADE,
   CONSTRAINT FKReservation_evtId FOREIGN KEY (evtId) REFERENCES Event (id)
      ON DELETE CASCADE
);
