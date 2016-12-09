---
layout: post
title: Tale of Timezones and how FP is the Easy Way
categories: programming clojure
tags: clojure functions
author:
    name: Moiz Jinia
    email: moiz.jinia@gmail.com
    meta: Backend Clojure Dev @ Helpshift
---

### Business hours check for a global business: The problem statement

Customer support teams of large global organizations have teams working in multiple geographies across multiple time zones. Each of these teams usually have their own set of business days and hours (in their respective time zones). Below is a Clojure map that represents an example business hours and days configuration for an org -

    (def test-business-timings
      {:business-days [true true false true true false true] ;; Mon-Sun
       :business-hours [;; Monday
                        [{:from {:hours 16 :minutes 0}
                          :to {:hours 17 :minutes 0}
                          :timezone "Asia/Kolkata"}
                         {:from {:hours 13 :minutes 0}
                          :to {:hours 18 :minutes 0}
                          :timezone "America/Los_Angeles"}]
                        ;; Tuesday
                        [{:from {:hours 8 :minutes 0}
                          :to {:hours 18 :minutes 0}
                          :timezone "Pacific/Kiritimati"}]
                        ;; Wednesday
                        []
                        ;; Thursday
                        [{:from {:hours 1 :minutes 0}
                          :to {:hours 3 :minutes 0}
                          :timezone "UTC"}
                         {:from {:hours 10 :minutes 0}
                          :to {:hours 18 :minutes 0}
                          :timezone "Asia/Kolkata"}]
                        ;; Friday
                        [{:from {:hours 0 :minutes 0} ;;all day
                          :to {:hours 0 :minutes 0}
                          :timezone "US/Hawaii"}]
                        ;; Saturday
                        []
                        ;; Sunday
                        [{:from {:hours 9 :minutes 0}
                          :to {:hours 17 :minutes 0}
                          :timezone "US/Hawaii"}]]})

When a support ticket from a customer comes in, we need an automated way to check whether any of the global support teams are within business hours.


### Approaching the problem

#### Which day of the week is it for the support teams?

Before making the check for business days, you need to determine what the current day of the week is ('today'). You need to account for the possibilities that it might still be 'yesterday' in some timezone or may already be 'tomorrow' in some timezone. And a team in some timezone behind or ahead of the server time may be in business hours.

#### On this day and at this time, do I have an actively working support team somewhere or not?

When making a check for a specific business day, building the time interval for the specified business hours (for that day) needs to take into account both timezone and the notion of what is the current day.

### Solution

#### An approach that didn't fly

Convert all the input business hours to UTC before making the check. There are 2 problems with that approach -

* Shifting the business hours to UTC could mean crossing the day boundary (ahead or behind). And this gets complicated by the fact that we need to factor in business days (not just hours). We'd have to also build a transformed list of UTC business days.
* We can't store the business hours and days configuration in UTC format because the next time the user edits them, they'll need to see it in the time zones they originally used.

#### The one that did

The solution relies on the fact that no time zone in the world is more than a day apart from UTC. In other words, no matter what timezone you're in, relative to the UTC day it could never be 'day after tomorrow' nor could it still be 'day before yesterday'.

In order to solve this problem, we assume whatever is the current day of week per UTC to be our current day of week. And then we need to make the following 3 checks -

* whether 'today' is a business day, and whether 'right now' falls in 'today's' business hours
* whether 'tomorrow' is a business day, and whether 'right now' falls in 'tomorrow's' business hours
* whether 'yesterday' is a business day, and whether 'right now' falls in 'yesterday's' business hours

### Code

Before I dive into the actual code, I'd like to side step a bit and dwell on how using Clojure (and FP in general) makes the solution intuitive.

#### Functions are Fun. And natural.

I started out as a Java programmer and I clearly remember that in my first few months at my first job, my natural tendency was to write a lot of C-style functions. And the way to do that in Java is to use static methods and classes. And this immediately stands out as a code smell or bad practice in the object oriented Java world. You need to think about modeling things as 'real world objects' I was told. Whatever that meant. Of course I adapted, moved on and eventually became a 'good' Java programmer. Working with Clojure now has made me rediscover that long lost natural tendency. I now write code in the style that is most obvious from a logic perspective. Little functions that each do one thing. I've come full circle - from instinctively thinking that functions are good, to being told that functions are bad, to finally understanding that functions are good. Java 8 now has functions you may say. But the truth is that just 'supporting' or 'allowing' functions as first class citizens is very different from a being a functional language at the heart. Which Java 8 certainly isn't.

IMHO - an important characteristic of good code is that it makes the code look simple or easy. Its like a good batsman (in cricket) makes batting look easy. And this is something that I find in abundance in the Clojure ecosystem.

#### Clojure's awesome date time lib : [clj-time](https://github.com/clj-time/clj-time)

Clojure has a feature rich, intuitive, and expressive date time library called clj-time. It's an excellent example of what an easy-to-use API should look like. And using such a lib adds to the simplicity and elegance of your code.

#### Lets write the code

We'll walk through and build the solution from the bottom up. The intent is to highlight how functional programming is the most natural way of building a solution with small, coherent, re-usable and composable functions.

We first create a Clojure NS for the solution. The only external lib we need is the above mentioned date time lib.

    (ns business-timings.core
      (:require [clj-time.core :as t]))

First off, three simple functions that tell us 'today', 'tomorrow', and 'yesterday' for a specific UTC date time instance. Each of these return a number in the range of 1-7 representing the day of the week.

    (defn- today
      [dt]
      (t/day-of-week dt))

    (defn- tomorrow
      [dt]
      (t/day-of-week (t/plus dt (t/days 1))))

    (defn- yesterday
      [dt]
      (t/day-of-week (t/minus dt (t/days 1))))

Now, a couple of functions that allows us to read the business hours for a specified day of week, and tell us whether a given day is a business day or not.

    (defn- business-day?
      [day business-timings]
      ;; decerement day for zero based index
      (get (:business-days business-timings) (dec day)))

    (defn- timings-for-day
      [day business-timings]
      ;; decerement day for zero based index
      (get (:business-hours business-timings) (dec day)))

Lets now use all the above to create functions that can tell us the corresponding timings for today, tomorrow, and yesterday. And whether they are business days.

    (defn- timings-today
      [business-timings dt]
      (timings-for-day (today dt) business-timings))

    (defn- timings-tomorrow
      [business-timings dt]
      (timings-for-day (tomorrow dt) business-timings))

    (defn- timings-yesterday
      [business-timings dt]
      (timings-for-day (yesterday dt) business-timings))

    (defn- business-day-today?
      [business-timings dt]
      (business-day? (today dt) business-timings))

    (defn- business-day-tomorrow?
      [business-timings dt]
      (business-day? (tomorrow dt) business-timings))

    (defn- business-day-yesterday?
      [business-timings dt]
      (business-day? (yesterday dt) business-timings))

Next, once we've read the business hours for a day, we'll need some functions to help us build the actual time intervals for those business hours. In other words, the date time instances corresponding to the start time and end time of the business hours (on a given day). Note - these start and end date-time instances will need to be created in the timezone used in the configuration.

    (defn- business-hours-start-today
      [time-slot dt]
      (t/from-time-zone
        (t/date-time (t/year dt) (t/month dt) (t/day dt)
                     (get-in time-slot [:from :hours])
                     (get-in time-slot [:from :minutes]))
        (t/time-zone-for-id (:timezone time-slot))))


    (defn- business-hours-end-today
      [time-slot dt]
      (let [end-hour (get-in time-slot [:to :hours])
            end-minute (get-in time-slot [:to :minutes])]
        (t/from-time-zone
          (if (every? zero? [end-hour end-minute])
            (t/date-time (t/year dt) (t/month dt) (t/day dt) 23 59 59 999)
            (t/date-time (t/year dt) (t/month dt) (t/day dt) end-hour end-minute))
          (t/time-zone-for-id (:timezone time-slot)))))


    (defn- busines-hours-start-yesterday
      [time-slot dt]
      (t/minus (business-hours-start-today time-slot dt) (t/days 1)))


    (defn- business-hours-end-yesterday
      [time-slot dt]
      (t/minus (business-hours-end-today time-slot dt) (t/days 1)))


    (defn- business-hours-start-tomorrow
      [time-slot dt]
      (t/plus (business-hours-start-today time-slot dt) (t/days 1)))


    (defn- business-hours-end-tomorrow
      [time-slot dt]
      (t/plus (business-hours-end-today time-slot dt) (t/days 1)))

Lets now use the above to create check functions for today, tomorrow, and yesterday. The check passes if the specified date time instance falls in any of the time slots configured for a particular day. As you may remember, the problem statement requires allowing multiple different time slots for the same day (each with its own timezone). We use clj-time's [within?](https://github.com/clj-time/clj-time/blob/master/src/clj_time/core.clj#L619) function (which is timezone aware) to make this check. Hence we don't need to shift the specified date time instance to the timezone used for the business hours.

    (defn within-todays-business-timings?
      [business-timings dt]
      (when (business-day-today? business-timings dt)
        (let [time-slots (timings-today business-timings dt)]
          (some (fn [time-slot]
                  (t/within? (business-hours-start-today time-slot dt)
                             (business-hours-end-today time-slot dt)
                             dt))
                time-slots))))


    (defn within-tomorrows-business-timings?
      [business-timings dt]
      (when (business-day-tomorrow? business-timings dt)
        (let [time-slots (timings-tomorrow business-timings dt)]
          (some (fn [time-slot]
                  (t/within? (business-hours-start-tomorrow time-slot dt)
                             (business-hours-end-tomorrow time-slot dt)
                             dt))
                time-slots))))


    (defn within-yesterdays-business-timings?
      [business-timings dt]
      (when (business-day-yesterday? business-timings dt)
        (let [time-slots (timings-yesterday business-timings dt)]
          (some (fn [time-slot]
                  (t/within? (busines-hours-start-yesterday time-slot dt)
                             (business-hours-end-yesterday time-slot dt)
                             dt))
                time-slots))))

And now the final check function that will essentially be the API for this NS. And it'll use all the functions we have defined so far. The check passes if the specified date time instance falls in either today, tomorrow, or yesterday's business hours.

    (defn within-business-timings?
      [business-timings dt]
      (or (within-todays-business-timings? business-timings dt)
          (within-tomorrows-business-timings? business-timings dt)
          (within-yesterdays-business-timings? business-timings dt)))

    (comment (within-business-timings? test-business-timings (t/now)))

### Summary

Functional programming is not about coolness or the bleeding edge. Rather it is - in my humble opinion - the most natural and easy way to solve a problem. With the side benefit that its also cool, and the bleeding edge. For full code and tests, see here https://github.com/moizsj/business-timings/