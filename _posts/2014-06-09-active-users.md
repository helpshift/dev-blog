---
layout: post
title: Efficient way to calculate active Users
tags: hyperloglog set-cardinality data-structure
author:
    name: Kiran Kulkarni
    email: kk@helpshift.com
    meta: Backend Engineering
---

In analytics we like to track every interaction of an user with the
system. Whenever an user interacts with our system we record an
*event*. This *event* usually contains an *id* which can uniquely
identify the user. This id can be a cookie, IP address or Vendor ID in
an iOS App.  **Active Users** is a number of unique users who
interacted with the system. Active users are calculated over a
time-period, e.g. **Monthly Active Users (MAU)**,**Weekly Active Users
(WAU)** or **Daily Active Users (DAU)**. So when you want to calculate
and MAU, you will gather all the events in last month and count number
of unique *ids*. This means that Active Users is *cardinality* of
*set* of all the *ids* from these *events*.

i.e.

$$
\begin{equation}
Active Users = \left\vert\{id \mid \forall id \in Events\}\right\vert
\end{equation}
$$

In clojure this can be done using a simple reduce function

{% highlight clojure %}
(count
 (reduce #(conj %1 (:id %2))
         #{}
         events))
{% endhighlight %}

Here memory usage is directly proportional to number of unique
users. Let's assume that your ID is a `16` character string which will
consume `16 bytes` (each character uses 1 byte) of your memory.
Mobile apps like Whatsapp has *400 Million* MAUs, which means you need
`5GB` of memory (RAM). This is just one count for one app. you need to
count DAU, WAU everyday. You will run out of vertical scaling options
by the time you reach *1 Billion* active Users.

Active-users is a set cardinality problem and fortunately there has
been a lot of research in this area.  Following is the list of
probabilistic algorithms that are space-efficient and can be used for
Active Users calculation.

1.  Linear Counting [^1]
2.  LogLog Counting [^2]
3.  Hyperloglog Counting [^3]

You can find clojure implementation for **`linear counting`** and
**`loglog counting`** in [Quipu](https://github.com/kirankulkarni/quipu).

# Linear Counting

This is a two step algorithm, In step1 you allocate a bit-map of
size `m`. All the entries of bitmap are initialized to `0`. When you
want to add an element in structure, you run a hash-function on
data which gives you an address in the bit-map. The algorithm sets
the bit to `1` at that generated address. In step2 algorithm first
counts number of empty bit map entries (bits which are still set to
`0`). It then estimates the cardinality by dividing this count by
bit-map size `m`.
Algorithm allows us to decide how accurate we want this algorithm to
be. [Quipu](https://github.com/kirankulkarni/quipu) implements this algorithm with *1%* error rate hence
providing a lot of space optimization

# LogLog Counting

LogLog algorithm makes use of `m` *small bytes* of memory to calculate
the cardinality, and it does so with accuracy that is order of
`1.30/√m`.

The *small bytes* to be used in order to estimate set with
cardinality Nmax comprise of loglog(Nmax) bits. Hence cardinalities
in the range of billions can be determined using 2KB of memory.

If you pick `m` to be 32 then you will have *32 small bytes* where
every *small byte* is made up of *5 bits* i.e. m = 2^k where k is the number
of bits in *small byte*. Cardinality is a function of average of
numbers represented in these *small bytes*. Hence as m increases,
accuracy of this algorithm increases.

[Quipu](https://github.com/kirankulkarni/quipu) implementation of this algorithm let's you choose the accuracy
while provisioning a counter.

# HyperLogLog

It is similar to LogLog algorithm but provides better accuracy
for same space. For `m` *small bytes* it provides accuracy of
`1.04/√m`.

# Advantages

## Space Efficient and Tunable Accuracy

I calculated number of unique words from [The Complete Works of
Shakespeare](http://www.gutenberg.org/ebooks/100.txt.utf-8) It has total `1,410,671` words (including duplicates).

Total words : `1,410,671`
Unique Words: `59,724`

|Method                           | Estimated Count |Memory Usage      |
|:--------------------------------|:---------------:|-----------------:|
| Clojure Set                     | 59,724          | 5,421,192 ~ 5 MB |
| Linear Counting                 | 59,868          | 25,439 ~ 24 KB   |
| LogLog Counting (4% Error Rate) | 59,774          | 640 ~ 0.6 KB     |
|---
{: rules="groups"}

## Commutative and Associative

All these algorithms are commutative and associative like basic
sets. These cardinality estimation counters are represented as
bit-maps, one can merge bitmaps of two counters (of same type) to
get a single counter. The algorithm handles collisions and hence
this merged counter gives same result as if you had used single
counter from the start.

Because of this property you can just calculate Active users for a
day and store your counters. When you need to calculate MAU just
merge 30 days counters and get Monthly Active Users without processing
the raw data again. You can also use this property in a Hadoop Job,
where map-phases will produce counters for local data and
reduce-phase will merge those counters to get final cardinality.



[^1]: [Kyu-Young Whang , Brad T. Vander-Zanden , Howard M. Taylor, A linear-time probabilistic counting algorithm for database applications, ACM Transactions on Database Systems (TODS), v.15 n.2,p.208-229, June 1990](http://dl.acm.org/citation.cfm?id%3D78925&CFID%3D359353900&CFTOKEN%3D83197792)

[^2]: [Loglog counting of large cardinalities - Durand, Flajolet - 2003](http://algo.inria.fr/flajolet/Publications/DuFl03-LNCS.pdf)

[^3]: [HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm - Philippe Flajolet and Éric Fusy and Olivier Gandouet and FrédéricMeunier](http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf)
