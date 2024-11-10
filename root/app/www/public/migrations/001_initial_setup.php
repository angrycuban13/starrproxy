<?php

/*
----------------------------------
 ------  Created: 082124   ------
 ------  Austin Best	   ------
----------------------------------
*/

$q = [];
$q[] = "CREATE TABLE " . SETTINGS_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL
        )";

$q[] = "CREATE TABLE " . NOTIFICATION_PLATFORM_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        platform TEXT NOT NULL UNIQUE,
        parameters TEXT NOT NULL
        )";

$q[] = "INSERT INTO " . NOTIFICATION_PLATFORM_TABLE . "
        (`id`, `platform`, `parameters`) 
        VALUES 
        ('" . NotificationPlatforms::NOTIFIARR . "', 'Notifiarr', '{\"apikey\":{\"label\":\"API Key\",\"description\":\"The Notifiarr API key from your profile (integration specific or global)\",\"type\":\"text\",\"required\":\"true\"}}'),
        ('" . NotificationPlatforms::TELEGRAM . "', 'Telegram', '')";

$q[] = "CREATE TABLE " . NOTIFICATION_TRIGGER_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        label TEXT NOT NULL,
        description TEXT NOT NULL,
        event TEXT NOT NULL
        )";

$q[] = "INSERT INTO " . NOTIFICATION_TRIGGER_TABLE . "
        (`name`, `label`, `description`, `event`) 
        VALUES 
        ('blocked', 'Blocked', 'Send a notification when an endpoint is blocked', 'blocked')";

$q[] = "CREATE TABLE " . NOTIFICATION_LINK_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        platform_id INTEGER NOT NULL,
        platform_parameters TEXT NOT NULL,
        trigger_ids TEXT NOT NULL
        )";

$q[] = "CREATE TABLE " . STARRS_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        starr INTEGER NOT NULL,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        apikey TEXT NOT NULL,
        username TEXT NULL,
        password TEXT NULL
        )";

$q[] = "CREATE TABLE " . APPS_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        apikey TEXT NOT NULL UNIQUE,
        starr_id INTEGER,
        endpoints TEXT NULL
        )";

//-- ALWAYS NEED TO BUMP THE MIGRATION ID
$q[] = "INSERT INTO " . SETTINGS_TABLE . "
        (`name`, `value`) 
        VALUES 
        ('migration', '001')";

foreach ($q as $query) {
	logger(MIGRATION_LOG, '<span class="text-success">[Q]</span> ' . preg_replace('!\s+!', ' ', $query));

    $proxyDb->query($query);

	if ($proxyDb->error() != 'not an error') {
		logger(MIGRATION_LOG, '<span class="text-info">[R]</span> ' . $proxyDb->error(), 'error');
	} else {
		logger(MIGRATION_LOG, '<span class="text-info">[R]</span> query applied!');
	}
}

$q = [];
$q[] = "CREATE TABLE " . USAGE_TABLE . " ( 
        id INTEGER PRIMARY KEY,
        app_id INTEGER NOT NULL UNIQUE,
        allowed INTEGER,
        rejected INTEGER
        )";

foreach ($q as $query) {
	logger(MIGRATION_LOG, '<span class="text-success">[Q]</span> ' . preg_replace('!\s+!', ' ', $query));

    $usageDb->query($query);

	if ($usageDb->error() != 'not an error') {
		logger(MIGRATION_LOG, '<span class="text-info">[R]</span> ' . $usageDb->error(), 'error');
	} else {
		logger(MIGRATION_LOG, '<span class="text-info">[R]</span> query applied!');
	}
}

//-- PRE-DB SUPPORT, POPULATE THE NEW TABLES WITH EXISTING DATA
if (file_exists(APP_DATA_PATH . 'settings.json')) {
    $q = [];
    $settingsFile = getFile(SETTINGS_FILE);

    foreach (StarrApps::LIST as $starrApp) {
        if ($settingsFile[$starrApp]) {
            foreach ($settingsFile[$starrApp] as $starrAppIndex => $starrAppInstanceDetails) {
                $starrAppInstanceDetails['username'] = $starrAppInstanceDetails['username'] ?: '';
                $starrAppInstanceDetails['password'] = $starrAppInstanceDetails['password'] ?: '';

                $q = "INSERT INTO " . STARRS_TABLE . "
                      (`starr`, `name`, `url`, `apikey`, `username`, `password`) 
                      VALUES 
                      ('" . $starr->getStarrInterfaceIdFromName($starrApp) . "', '" . $proxyDb->prepare($starrAppInstanceDetails['name']) . "', '" . $starrAppInstanceDetails['url'] . "', '" . $starrAppInstanceDetails['apikey'] . "', '" . $proxyDb->prepare($starrAppInstanceDetails['username']) . "', '" . $proxyDb->prepare($starrAppInstanceDetails['password']) . "')";
                $proxyDb->query($q);
                
	            logger(MIGRATION_LOG, '<span class="text-success">[Q]</span> ' . preg_replace('!\s+!', ' ', $q));
                if ($proxyDb->error() != 'not an error') {
                    logger(MIGRATION_LOG, '<span class="text-info">[R]</span> ' . $proxyDb->error(), 'error');
                } else {
                    $id = $proxyDb->insertId();
                    logger(MIGRATION_LOG, '<span class="text-info">[R]</span> query applied, starrs table id \'' . $id . '\'!');

                    $starrAccessApp = $settingsFile['access'][$starrApp];
                    foreach ($starrAccessApp as $access) {
                        $q = "INSERT INTO " . APPS_TABLE . "
                            (`name`, `apikey`, `starr_id`, `endpoints`) 
                            VALUES 
                            ('" . $proxyDb->prepare($access['name']) . "', '" . $access['apikey'] . "', '" . $id . "', '" . json_encode($access['endpoints'] ?: []) . "')";
                        $proxyDb->query($q);
                        
                        logger(MIGRATION_LOG, '<span class="text-success">[Q]</span> ' . preg_replace('!\s+!', ' ', $q));
                        if ($proxyDb->error() != 'not an error') {
                            logger(MIGRATION_LOG, '<span class="text-info">[R]</span> ' . $proxyDb->error(), 'error');
                        } else {
                            logger(MIGRATION_LOG, '<span class="text-info">[R]</span> query applied, apps table id \'' . $id . '\'!');
                        }
                    }
                }
            }
        }
    }
}