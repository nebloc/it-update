package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

var subs = make(chan Submission, 5)

func main() {
	router := gin.Default()

	router.Use(cors.Default())

	api := router.Group("/api/v1")
	{
		api.GET("/health", healthCheck)
		api.POST("/submission", newSubmission)
	}
	router.Use(static.Serve("/", static.LocalFile("./frontend/build", true)))

	go saveSubs(subs)

	router.Run(":8080")
}

func saveSubs(subs <-chan Submission) {
	file, err := os.OpenFile("submissions.json", os.O_CREATE|os.O_WRONLY|os.O_APPEND, os.ModePerm)
	if err != nil {
		fmt.Printf("FECK")
	}
	for {
		sub, more := <-subs
		if more {
			b, err := json.Marshal(sub)
			if err != nil {
				fmt.Println("Fuck")
			}
			file.Write(b)
			file.WriteString("\n")
		} else {
			fmt.Println("ended")
			return
		}
	}
}

func healthCheck(c *gin.Context) {
	c.String(http.StatusOK, "Healthy")
}

// newSubmission receives a post request of a new submission, and saves it
func newSubmission(c *gin.Context) {
	var sub Submission

	if err := c.BindJSON(&sub); err != nil {
		fmt.Printf("could not bind json: %v", err)
		c.AbortWithError(http.StatusBadRequest, err)
		return
	}

	if !strings.HasSuffix(sub.Email, "@thebodyshop.com") {
		c.String(http.StatusBadRequest, "Must use a bodyshop email address")
		return
	}

	subs <- sub

	c.String(http.StatusOK, "Submission Added")
}

// Submission holds a users talk submission with details on the subject, and who submitted it
type Submission struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
}
