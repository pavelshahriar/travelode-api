CREATE DATABASE  IF NOT EXISTS `travelodeApi` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `travelodeApi`;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `media`
--

DROP TABLE IF EXISTS `media`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` int(11) NOT NULL,
  `filename` varchar(500) NOT NULL,
  `userId` int(11) NOT NULL,
  `uploaded` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  `locationId` int(11) NOT NULL,
  `created` datetime NOT NULL,
  `sizeX` varchar(45) DEFAULT NULL,
  `sizeY` varchar(45) DEFAULT NULL,
  `storage` varchar(45) NOT NULL DEFAULT 'disk',
  PRIMARY KEY (`id`),
  UNIQUE KEY `path_UNIQUE` (`filename`),
  KEY `type` (`type`),
  KEY `mediaUserId_idx` (`userId`),
  KEY `mediaLocationId_idx` (`locationId`),
  CONSTRAINT `mediaLocationId` FOREIGN KEY (`locationId`) REFERENCES `location` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `mediaUserId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=71 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `privacy`
--

DROP TABLE IF EXISTS `privacy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `privacy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_UNIQUE` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  KEY `travelodePrivacyId_idx` (`privacy`),
  CONSTRAINT `travelodePrivacyId` FOREIGN KEY (`privacy`) REFERENCES `privacy` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `travelodeUserId` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `rollNo` int(11) NOT NULL DEFAULT '0',
  `privacy` int(11) NOT NULL,
  `title` varchar(45) NOT NULL,
  `caption` varchar(200) DEFAULT NULL,
  `displayDate` datetime NOT NULL,
  `displayLocationId` int(11) DEFAULT NULL,
  `isCover` int(11) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `travelodeMediaTravelodeIdMediaId_Unique_idx` (`travelodeId`,`mediaId`),
  KEY `travelodeMediaMediaId_idx` (`mediaId`),
  KEY `travelodeMediaDisplayLocationId_idx` (`displayLocationId`),
  KEY `travelodeMediaTravelodeId_idx` (`travelodeId`),
  KEY `travelodeMediaPrivacyId_idx` (`privacy`),
  KEY `travelodeMediaisCover` (`isCover`),
  KEY `travelodeMediaCreated` (`created`),
  KEY `travelodeMediaUpdated` (`updated`),
  CONSTRAINT `travelodeMediaDisplayLocationId` FOREIGN KEY (`displayLocationId`) REFERENCES `location` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `travelodeMediaMediaId` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `travelodeMediaPrivacyId` FOREIGN KEY (`privacy`) REFERENCES `privacy` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `travelodeMediaTravelodeId` FOREIGN KEY (`travelodeId`) REFERENCES `travelode` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  UNIQUE KEY `travelodeMediaCategoryTravelodeIdMediaIdCategoryId_Unique_idx` (`travelodeId`,`mediaId`,`categoryId`),
  KEY `travelodeMediaCategoryTravelodeId_idx` (`travelodeId`),
  KEY `travelodeMediaCategoryMediaId_idx` (`mediaId`),
  KEY `travelodeMediaCategoryCategoryId_idx` (`categoryId`),
  CONSTRAINT `travelodeMediaCategoryCategoryId` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `travelodeMediaCategoryMediaId` FOREIGN KEY (`mediaId`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `travelodeMediaCategoryTravelodeId` FOREIGN KEY (`travelodeId`) REFERENCES `travelode` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `fullname` varchar(145) DEFAULT NULL,
  `photo` int(11) DEFAULT NULL,
  `created` datetime NOT NULL,
  `updated` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_UNIQUE` (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`),
  KEY `UserPhotoId_idx` (`photo`),
  CONSTRAINT `UserPhotoId` FOREIGN KEY (`photo`) REFERENCES `media` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-08-09 21:35:54
