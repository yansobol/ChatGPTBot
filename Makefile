build:
	docker build -t chatgptbot .

run: 
	docker run -d -p 3000:3000 --name chatgptbot --rm chatgptbot