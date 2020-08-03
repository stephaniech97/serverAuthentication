# serverAuthentication
Taak:
https://github.com/comunica/comunica/issues/613

Code comes from this link: 
https://medium.com/@evangow/server-authentication-basics-express-sessions-passport-and-curl-359b7456003d

Conclusion:
How to use use in the server directory
npm run dev:server

How to use use in the db directory
npm run json:server

Voor authenticated fetch : aanpassen van de config file in de sparql init is noodzakelijk(!) voordat comunica deze zal gebruiken. Het gebruikt normaal de config file met native. Deze actor folder in de repo steken (andere replacen) en dan de config file aanpassen zou het spel moeten activeren.

commando in terminal poging tot testing
node ./packages/actor-init-sparql-file/bin/query.js http://stchen:passwd@localhost:4000/login -f query.sparql 

probleem along the way @ parsing van de url :
https://github.com/comunica/comunica/blob/master/packages/actor-init-sparql/lib/ActorInitSparql.ts#L143


"Voor die server vraag : ik heb momenteel een server die kan authenticaten. Dus eenmaal de config aangepast met de fetch node kan ik mijn server opstarten. Moet ik dan de volgende link in comunica te zetten node ./packages/actor-init-sparql/bin/http.js "{ \"sources\": [{ \"type\": \"hypermedia\", \"value\" : \"localhost/login\" }]}" Als mijn localhost/login de authentication doet? Je zei ook iets over rdf files. Moet ik een rdf file terugsturen of ? "

Antwoord van Ruben
=> Ik zou gewoon bin/query.js gebruiken ipv http.js, zal testen makkelijker maken
