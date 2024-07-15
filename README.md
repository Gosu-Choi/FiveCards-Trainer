# FiveCards Trainer

The highest form of wisdom is knowing when to play and when to stay away. This is a quote for Poker gamers as well as for people who are living in their life. But how could we be the person who is able to distinguish those timings? That was the question what I started this project with.

## Introduction

The objective of this project is implementation of a trainer which can effectively improve the decision making capability of user who should make ① serial decisions ② repeatedly ③ under uncertainty.

It is so various that situations which satisfy these three conditions. In our reallife, "Negotiation" would be good example. From daily bargain to M&A by Enterprise, serial decision making under uncertainty should be needed and it will be repeated until demise.

The ultimate goal would be to deal with these things like negotiations, which can be easily found in our life as far I mentioned. But it is difficult to establish simulation systems with computer so that it can be connected with controllable algorithm and to implement trainer. Thus, in this project 'game' has been utilized to progress this project as well and to find great insights applicable for our reallife quickly, due to the fact that games are standardized as well than the stuffs in reality. And finally 'Poker' has been selected among several games which satisfy three conditions.

## FiveCards Trainer: realtime decision making feedback during gameplay

The main rules of poker is quite difficult including the hand-ranking which indicates who's hand is superior, but the thing which the players can do is one of three. Player only can fold (giving that game up) or raise (raising the pot) or call (accept to continue the game) for a game. Among these three, it is raise that the most of beginners have been perplexed by. Because it is hard to distinguish when they should raise and what they should do to counter the raise by opponent.

Many poker players do raise much (over money on the pot) one game per two game or even once a round in terms of frequency. But it is so rare that the 'over raise' performs good effects for the player. Because doing over raise is very big burden for the table money of the player because most of betting rules player should bet more than the present pot. So the numerical data which I mentioned above implies that many players do over raise under the situation where they must not raise in fact. 

If the players must not raise much under most of all situation, then when should we do raise over the pot? Does it even exist unless I have 100% winning hand? The answer of this question is actually yes. The most representative case is that (It is really rare) in five-card-stud where players have only one hidden card among five cards, the player has visual K triple and the opponent has visual J four-card, and more than two betting chance has remained, and if opponent call for all of the raise by those chances, then opponent bet all of his or her table money. If rationality is assumed then opponent must fold when the player raise for the first chance. Because he will lost all of the table money and he will lost chance for participating next game to make it up. So from the opponent's perspective, his or her hand is good but it should be folded because opponent's hand is lethal.

As I explained, whether a player should raise should be determined by several elements like the hands of other players, how much money betted in each betting phases and how much table money remained for each players. Sure, it is too difficult to determine it accurately like a computer. Because there time limit also exists and proficient players can utilize the time length I considered to estimate my hand with it. So the decision making process is not able to be standardized, it should be embodied.

The trainer developed in this project can provide help to players on this context. It helps players to make their intuition based on the data sharp. As players actually play with bots, the previous decision can be specifically fed back based on the probability of being reckless or unintelligent, and by receiving a number of cases they did not consider, they can confirm that their judgment was rash. They can also learn and grow quickly by many cases which can be checked in the bot's decision-making rationales.

## Details including poker rules

This project follows five-card studs and Texas Hold'em rules. While commonly enjoyed games such as Seven Poker and Baduki could also be implemented, the simplest version of the game rules was selected to ensure ease in implementation and to prevent trainers from failing to provide adequate feedback due to over-complicated strategies. Bots and trainers are implemented with ChatGPT API (GPT-4o).

## Technologies Used
Frontend: React / Backend: Express, Prisma, MySQL
