.PHONY: init dev dev-backend dev-frontend uat prod clean docker-up docker-down docker-build

# Install dependencies for both Backend and Frontend
init:
	@echo "Installing Backend dependencies..."
	cd Backend && npm install
	@echo "Installing Frontend dependencies..."
	cd Frontend && npm install

# Run Development environment (Backend and Frontend in parallel)
dev:
	@echo "Starting Development Environment..."
	# Run backend and frontend in parallel using make's job server is one way, 
	# but simple shell backgrounding is often more portable for interactive processes.
	# We use a trap to kill background processes on exit.
	trap 'kill %1; kill %2' SIGINT; \
	(cd Backend && npm start) & \
	(cd Frontend && npm start) & \
	wait

# Run UAT environment
# Builds the frontend and runs backend in UAT mode
uat:
	@echo "Building Frontend for UAT..."
	cd Frontend && npm run build
	@echo "Starting Backend in UAT mode..."
	cd Backend && NODE_ENV=uat node app.js

# Run Production environment
# Builds the frontend and runs backend in Production mode
prod:
	@echo "Building Frontend for Production..."
	cd Frontend && npm run build
	@echo "Starting Backend in Production mode..."
	cd Backend && NODE_ENV=production node app.js

# Clean dependencies and build artifacts
clean:
	@echo "Cleaning up..."
	rm -rf Backend/node_modules
	rm -rf Frontend/node_modules
	rm -rf Frontend/build

# Docker Compose commands
docker-up:
	@echo "Building and starting containers (preserving MySQL data)..."
	docker-compose up --build -d
	@echo "Cleaning up dangling images..."
	docker image prune -f

docker-down:
	@echo "Stopping Docker Compose services..."
	docker-compose down

docker-build:
	@echo "Building Docker Compose services..."
	docker-compose up --build -d
