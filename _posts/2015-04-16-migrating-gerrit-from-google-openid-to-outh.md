---
layout: post
title: Migrating Gerrit from Google OpenID to Oauth
date: 2015-04-10
categories: Tech
tags:
- Gerrit
- Oauth
author:
    name: Raghu Udiyar
    email: raghusiddarth@gmail.com
    meta: DevOps @ Helpshift
---

Google is phasing out [OpenID in favour of Oauth 2.0](https://developers.google.com/+/api/auth-migration) with a deadline on 20th April, 2015 - just 10 days from today. A lot of projects depend on google auth, and can't easily move to another OpenID provider. I recently had to fix this issue with Jenkins and Gerrit.

Jenkins has a great [plugin](https://wiki.jenkins-ci.org/display/JENKINS/Google+Login+Plugin) available for this, which was a piece of cake to install and configure. But it wasn't so easy with Gerrit. Lot of gerrit users have been asking for [Oauth support](https://code.google.com/p/gerrit/issues/detail?id=2677) since May last year; we got that finally when [David Ostrovsky](https://github.com/davido) wrote [gerrit-oauth-provider](https://github.com/davido/gerrit-oauth-provider) plugin.

I've listed the steps I followed below :

1. Oauth2 credentials

    Get these from [Google Developers Console](https://console.developers.google.com), note down the `client id` and `client secret`. Ensure the redirect url is set to `/oauth` i.e. `http://gerrit.yoursite.com/oauth`.

2. Get the custom gerrit war file

    There are a few gerrit [changes](https://gerrit-review.googlesource.com/#/q/topic:hybrid-openid-oauth-authentication-provider) the plugin needs that haven't been merged yet. A custom war is available [here](https://github.com/davido/gerrit-oauth-provider/releases/tag/v0.2) with the plugin. Download this `gerrit-2.10.2-18-gc6c5e0b.war` file to the new gerrit server.

3. Backup current gerrit data

    Create tarballs of the data directories and dump postgres data (if postgres is being used)

    ```
    old-gerrit~$ tar czpf gerrit.tar.gz /srv/gerrit/gerrit
    old-gerrit~$ tar czpf repositories.tar.gz /srv/gerrit/repositories
    old-gerrit~$ pg_dump -xO -Fc reviewdb > reviewdb-$(date +%d-%m-%Y).pdump
    ```
4. Restore data to new gerrit server

    ```
    gerrit:/srv/gerrit$ tar xzpf repositories.tar.gz
    gerrit:/srv/gerrit$ tar xzpf gerrit.tar.gz
    ```

5. Restore pg data

    ```
    psql : ALTER USER gerrit WITH SUPERUSER;
    $ dropdb reviewdb
    $ createdb reviewdb -O gerrit
    $ pg_restore -O -d reviewdb --role=gerrit reviewdb-20-03-2015.pdump
    psql: ALTER USER gerrit WITH NOSUPERUSER;
    ```

6. Run migrations

    Gerrit requires cascading migrations to be run for every major version released. For e.g to update from 2.5 to 2.10, we have to run the following

    ```
    $ sudo su - gerrit -s /bin/bash
    $ java -jar gerrit-2.8.6.1.war init -d gerrit
    $ java -jar gerrit-2.9.4.war init -d gerrit
    $ java -jar gerrit-2.9.4.war reindex --recheck-mergeable -d gerrit
    ```
    For the custom jar migration be sure to configure the Oauth plugin

    ```
    $ java -jar gerrit-2.10.1-4-a83387b.war init -d gerrit
    [...]
    OAuth Authentication Provider

    Use Google OAuth provider for Gerrit login ? [Y/n]?
    Application client id          : <client-id>
    Application client secret      : <client-secret>
                confirm password   :
    Link to OpenID accounts? [true]:
    Use GitHub OAuth provider for Gerrit login ? [Y/n]? n

    $ java -jar gerrit-2.10.1-4-a83387b.war reindex -d gerrit
    ```

7. Switch old gerrit domain name to the new server

    For automatic acount linking to work, the domain name must match the old server. Otherwise the OpenID accounts will not be linked with the new Oauth2 account.

8. Start gerrit server and confirm everything works

    ```
    gerrit:/srv/gerrit$ ./bin/gerrit.sh start
    ```

