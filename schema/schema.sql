-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: 127.0.0.1    Database: travelodeApi
-- ------------------------------------------------------
-- Server version	5.7.21

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location`
--

DROP TABLE IF EXISTS `location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `location` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `magnitude` varchar(45) NOT NULL,
  `lattitude` varchar(45) NOT NULL,
  `city` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `continent` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location`
--

LOCK TABLES `location` WRITE;
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
/*!40000 ALTER TABLE `location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL,
  `path` varchar(150) NOT NULL,
  `userId` int(11) NOT NULL,
  `uploaded` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `locationId` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `sizeX` varchar(45) DEFAULT NULL,
  `sizeY` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `path_UNIQUE` (`path`),
  KEY `type` (`type`),
  KEY `mediaUserId_idx` (`userId`),
  KEY `mediaLocationId_idx` (`locationId`),
  CONSTRAINT `mediaLocationId` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `mediaUserId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `media`
--

LOCK TABLES `media` WRITE;
/*!40000 ALTER TABLE `media` DISABLE KEYS */;
/*!40000 ALTER TABLE `media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `travelode`
--

DROP TABLE IF EXISTS `travelode`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `travelode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) NOT NULL,
  `description` varchar(150) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `privacy` int(11) NOT NULL,
  `coverId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `travelodeUserId_idx` (`userId`),
  CONSTRAINT `travelodeUserId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `travelode`
--

LOCK TABLES `travelode` WRITE;
/*!40000 ALTER TABLE `travelode` DISABLE KEYS */;
/*!40000 ALTER TABLE `travelode` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `travelode_media`
--

DROP TABLE IF EXISTS `travelode_media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `travelode_media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `travelodeId` int(11) NOT NULL,
  `mediaId` int(11) NOT NULL,
  `rollNo` int(11) NOT NULL,
  `privacy` int(11) NOT NULL,
  `title` varchar(45) NOT NULL,
  `caption` varchar(200) DEFAULT NULL,
  `displayDate` datetime NOT NULL,
  `displayLocationId` int(11) DEFAULT NULL,
  `attachmentDate` datetime NOT NULL,
  `isCover` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `isCover` (`isCover`),
  KEY `privacy` (`privacy`),
  KEY `travelodeMediaMediaId_idx` (`mediaId`),
  KEY `travelodeMediaDisplayLocationId_idx` (`displayLocationId`),
  KEY `travelodeMediaTravelodeId_idx` (`travelodeId`),
  CONSTRAINT `travelodeMediaDisplayLocationId` FOREIGN KEY (`displayLocationId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `travelodeMediaMediaId` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `travelodeMediaTravelodeId` FOREIGN KEY (`travelodeId`) REFERENCES `travelode` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `travelode_media`
--

LOCK TABLES `travelode_media` WRITE;
/*!40000 ALTER TABLE `travelode_media` DISABLE KEYS */;
/*!40000 ALTER TABLE `travelode_media` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `travelode_media_category`
--

DROP TABLE IF EXISTS `travelode_media_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `travelode_media_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `travelodeId` int(11) NOT NULL,
  `mediaId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `travelodeMediaCategoryTravelodeId_idx` (`travelodeId`),
  KEY `travelodeMediaCategoryMediaId_idx` (`mediaId`),
  KEY `travelodeMediaCategoryCategoryId_idx` (`categoryId`),
  CONSTRAINT `travelodeMediaCategoryCategoryId` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `travelodeMediaCategoryMediaId` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `travelodeMediaCategoryTravelodeId` FOREIGN KEY (`travelodeId`) REFERENCES `travelode` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `travelode_media_category`
--

LOCK TABLES `travelode_media_category` WRITE;
/*!40000 ALTER TABLE `travelode_media_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `travelode_media_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `fullname` varchar(145) NOT NULL,
  `photo` varchar(150) DEFAULT NULL,
  `created` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'pslocal@g.com','MED@B0$$','Pavel Shahriar',NULL,NULL);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-04-19  6:30:19
