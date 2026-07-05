// Command server wires together the mock data seed, in-memory
// repositories, services, and handlers, then starts the HTTP server for
// the wealth-management demo backend.
package main

import (
	"log"
	"net/http"
	"os"

	"wealthplatform-backend/internal/handler"
	"wealthplatform-backend/internal/httpserver"
	"wealthplatform-backend/internal/mockdata"
	"wealthplatform-backend/internal/repository/memory"
	"wealthplatform-backend/internal/service"
)

func main() {
	dataset := mockdata.Generate(mockdata.Seed)

	clientRepo := memory.NewClientRepo(dataset.Clients)
	transactionRepo := memory.NewTransactionRepo(dataset.Transactions)
	calendarRepo := memory.NewCalendarRepo(dataset.CalendarEvents)
	noteRepo := memory.NewNoteRepo(dataset.Notes)
	orderRepo := memory.NewOrderRepo(dataset.Orders)
	referenceRepo := memory.NewReferenceRepo(dataset.RmProfile, dataset.Underlyings, dataset.ModelPortfolios)

	clientSvc := service.NewClientService(clientRepo)
	transactionSvc := service.NewTransactionService(transactionRepo)
	calendarSvc := service.NewCalendarService(calendarRepo)
	noteSvc := service.NewNoteService(noteRepo)
	orderSvc := service.NewOrderService(orderRepo)
	referenceSvc := service.NewReferenceService(referenceRepo)

	handlers := httpserver.Handlers{
		Client:      handler.NewClientHandler(clientSvc),
		Transaction: handler.NewTransactionHandler(transactionSvc),
		Calendar:    handler.NewCalendarHandler(calendarSvc),
		Order:       handler.NewOrderHandler(orderSvc),
		Note:        handler.NewNoteHandler(noteSvc),
		Reference:   handler.NewReferenceHandler(referenceSvc),
	}

	router := httpserver.NewRouter(handlers)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port

	log.Printf("wealthplatform-backend listening on %s", addr)
	if err := http.ListenAndServe(addr, router); err != nil {
		log.Fatal(err)
	}
}
