---
layout: post
title: SensAI Predict - Building ticket <br/>classification service using NLP and ML
tags: predict ticket-classification 
author:
    name: Shyam Shinde
    email: shyam@helpshift.com
    meta: Machine Learning Engineer
---
## Motivation

Helpshift's customer service platform is used by companies such as Supercell, Microsoft and Zynga to receive support tickets from their users via mobile apps, web chat and email.
Thousands of new tickets are reported daily in the platform across our 2000+ customers and 2+ billion end-users worldwide. Every good company wants their customer service tickets to be resolved as soon as possible.
To achieve that quick turnaround, it's<br/> imperative that a ticket reaches the right agent who is best skilled at handling it. Hence, ticket classification and routing are two important functions to achieve the [efficiency strategy](https://www.helpshift.com/blog/three-es-customer-service/) for a customer service operation.

## How is ticket classification done today?

Today, companies have dedicated people focused on the mundane-yet-important work of ticket classification. As it is a manual step before tickets finally reach the agent, customer service centers face problems of scalability. As more tickets start coming in everyday as the company grows, they need to hire more agents for classification, making the model slow, complicated to coordinate and unscalable. Because of the repetitive nature of this work, customer service centers also face problems of attrition and the company needs to hire and train their personnel frequently. This involves a significant cost for the company.

Due to the nature of the customer service industry, there is a steep learning curve and even when skilled agents are available, there is an inadvertent delay in ticket handling and processing due to classification of tickets. Due to this, the time for first reply to the<br/> customer can increase even though support center has sufficient and skilled agents to work on the tickets.

After speaking with our customers, we came to know that some of them are using a <br/>cumbersome third party API for ticket classification. When a new ticket is created, third party API is called to apply label on that ticket. That got us thinking - why not build ticket classification into our system itself?

## What are the challenges in building automated ticket classification?

We wanted to build a system that could intelligently classify the tickets even before the customer support agent gets to see it, and depending on applied labels, organization can set actions like routing to particular agent.

The challenges in building such a classification system are:

* To not add significant latency in ticket creation because we are introducing<br/> a significant step of ticket classification.
* Must work for all of our customers.
* Tickets are in different languages, so we needed classification system supporting tens of different languages, ranging from Chinese to Portuguese.
* If we were going to leverage automatic routing of tickets using applied label, accuracy of classification system had to be as good as or better than existing company-specific manual routing.

Given above challenges, we needed completely automated workflow, where our customers can build their own classification model through our platform in few steps. This classification model will be used to apply unique label for each ticket. Using this unique label, admin can route particular label's ticket to set of agents.

In this article, we will discuss backend architecture of label prediction and present how the label prediction service has enabled automatic routing of incoming tickets.

## What does the ticket classification product look like?

In this example, an end-user has filed a ticket to know the price of a particular bag. Our prediction service has labeled the ticket "billing":

![predict_product](/images/2018-08-24-predict/predict_product.png)

## How to use applied label on a ticket?

Applying a correct label is not the end goal of ticket classification. We want to enable our customers to trigger particular actions like routing to a particular agent or group of agents (we call this a queue), send an auto-reply to the ticket, etc.

Here is one example - where action is set to **Assign ticket to product queue if predicted label is billing**

![Automation](/images/2018-08-24-predict/Automation.png)

## How did we build the ticket classification product?

We, the data intelligence team, started exploring different approaches to solve ticket classification. One method was to find set of keywords for each label. When new ticket comes, we will search keywords of each label in ticket's text and predict a label on search result. But it was not possible to find unique set of keywords for each label. Example, label like `order_tracking` and `order_nondelivery` have common keywords like `order_placed`, `return`, `wait` and `delayed`.

Next, we explored machine learning algorithms which can find patterns for each label from a tickets dataset. The machine learning experiments were promising and the early results were good. We decided to settle on a machine learning approach. The advantage of this model was that it can be updated by agent feedback on the correctness of the predicted label, which was not possible in the keyword search solution.

The engineers started working on a system which will be used to build the machine <br/>learning models and predict a unique label using pre-built model in real time. Helpshift's label prediction service uses natural language processing and machine learning classification algorithms to accurately predict the label. The set of labels from which label is chosen is decided by each customer.

### General flow in building the model

![model-build](/images/2018-08-24-predict/model_build.png)

1. The CSV dataset of tickets and their corresponding labels are required to train the classification model. The admin can use the SensAI tab in the dashboard to upload the dataset and build the classification model.

2. Our in-house ML platform prepares and validates the submitted tickets dataset.

3. Our in-house ML platform builds the classification model from the validated dataset.

   **Machine Learning steps while building model**

    ![ML-steps](/images/2018-08-24-predict/ML-steps.png)

    **Preprocessing**

    The goal of the preprocessing step is to collect required words from corpus of tickets text and find association of these words in the corpus. Preprocessing starts with cleaning the ticket data by removing HTML tags, numbers, urls, etc. which are not useful to find interesting patterns inside the dataset.

    After that we tokenize data by finding sentence boundaries and finding words in it. We apply stemming on words to create base words. To find words associations, we create bigrams and trigrams. 

    **Model building**

    We generated NLP features like vocabulary, word and ticket frequency matrix across labels. We started experimenting classification models using naive bayes classifier and logistic regression. But these common classification algorithms were not good enough to predict accurate label from large number of possible labels (solution space). These algorithms were predicting most common labels when the user writes short text in their ticket. This happened often when user submits ticket from their app or from<br/> webchat window in conversational UI.

    The data science team then started experimenting ML models which will work on short text tickets. We benchmarked accuracy of different algorithms against test data. We found that no single independent model was performing better than other models when compared on different parameters. When we use weighted average of mulitple models for prediction, the overall accuracy of classification was better than individual independent models. So, we decided to use ensemble of these individual models for production.

    The last step in model building is running validation on test data set and determining [precision and recall](https://en.wikipedia.org/wiki/Precision_and_recall) for each label and model accuracy. From validation results, we suggest optimal confidence threshold that should be applied on model to predict the label confidently.

4. Once model is built, it is stored in model store. This model is used to predict the label whenever a new ticket comes in.

### General flow in predicting label on new ticket

![label-predict](/images/2018-08-24-predict/label-predict.png)

1. Once a new support ticket comes in, it is collected by Helpshift servers. The Helpshift backend server knows company name for which end user has submitted ticket.

2. The backend service collects information such as whether label prediction service is enabled by our customer.  If label prediction is enabled, then the backend service<br/> detects language of ticket text. 
   The collected features are sent to label prediction<br/> service along with ticket text.

3. The prediction service fetches required models from the model store and predicts score for each available label in the model. The label with the highest score is <br/>attached to the ticket.

4. Once a label is attached to the ticket, our customer can decide what to do with that label - route to a particular team of agents (queue), auto-reply with a specific<br/> message, etc. This way, our customer can combine predicted label with Helpshift's strong workflow features to enable automation of sophisticated workflows. <br/>For example, if the ticket is about `lost account`, an automatic reply can be sent pointing to a FAQ explaining the required information and steps. Another example is if the ticket is about `app crash`, it might be routed to a high-priority queue where it is <br/>auto-assigned to the currently available agents.


5. When an agent sees applied label on ticket, they have an option to mark the predicted label as a wrong. The agent can also correct the predicted label for a ticket. This<br/> corrected label's data is sent to ML platform as a feedback to classification model.
   Feedback collected from agent is used to update the model so that model is tuned for better prediction. This feedback loop can seem magical because with more feedback from agents, the model becomes more accurate automatically.

   This enables two things:

   * Accuracy of model can improve to 90+%
   * New types of issues can be identified if agent marks predicted label as a wrong for many tickets.

## Lessons learned so far 

While we are continuously working on tuning our system for better results, here are some lessons learned so far:

* **Update the model with negative feedback**

    Collect agent's feedback on predicted label. This feedback is used to update model so that classification learns over time for accurate prediction. If agent marks predicted
    label as a wrong, we penalize the model parameters for predicting wrong label. In our case, we have observed that model always performs better when we update the <br/>model on feedback data.

    Updating the existing model by feedback helps in two ways - 

    * Model starts performing better in accuracy. It is like model learns from its wrong prediction.
    * We do not need to build the model from scratch periodically when we have new set of data.

* **Try to create a label for a unique type of ticket category**

    When model is built with for set of labels where each label represents a unique type of ticket category, such model always performs better in accuracy when compared with a model which has label representing more than one type of ticket category.

    Example, labels `order_nondelivery` and `order_delayed` represents same ticket category, so avoid having such labels for predictions. 


* **Build separate model for each languages**

    We have found that language dependant model gives better accuracy when compared with a model built on all languages ticket text.

If you're interested in working in a fast paced team, [we are hiring, join us!](https://www.helpshift.com/company/careers/)

-- [Shyam Shinde](https://twitter.com/shindesh11)


