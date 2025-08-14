// groovy-validator/src/main/groovy/com/yourproject/Validator.groovy
package com.yourproject

import static spark.Spark.*
import groovy.json.JsonSlurper
import groovy.json.JsonOutput
import java.time.Instant

class Validator {
    static void main(String[] args) {
        port(4567)
        println "Groovy validation service running on http://localhost:4567"

        // Endpoint for user registration validation
        post('/validate/register', { req, res ->
            def json = new JsonSlurper().parseText(req.body())
            def errors = validateRegistration(json)
            respond(res, errors)
        })

        // Endpoint for new booking validation
        post('/validate/booking/create', { req, res ->
            def json = new JsonSlurper().parseText(req.body())
            def errors = validateCreateBooking(json)
            respond(res, errors)
        })

        // Endpoint for updating a booking
        post('/validate/booking/update', { req, res ->
            def json = new JsonSlurper().parseText(req.body())
            def errors = validateUpdateBooking(json)
            respond(res, errors)
        })
    }
    
    // --- Validation Functions ---

    static List<String> validateRegistration(Map data) {
        def errors = []
        if (!data.name || data.name.size() < 3 || data.name.size() > 255) {
            errors.add('"name" must be between 3 and 255 characters long.')
        }
        if (!data.email || !data.email.contains('@')) { // Basic check
            errors.add('"email" must be a valid email.')
        }
        if (!data.password || data.password.size() < 6) {
            errors.add('"password" must be at least 6 characters long.')
        }
        return errors
    }

    static List<String> validateCreateBooking(Map data) {
        def errors = []
        if (!data.resource_name) errors.add('"resource_name" is required.')
        if (!data.start_time) errors.add('"start_time" is required.')
        if (!data.end_time) errors.add('"end_time" is required.')

        // Check if end_time is after start_time
        if (data.start_time && data.end_time) {
            try {
                def start = Instant.parse(data.start_time)
                def end = Instant.parse(data.end_time)
                if (!end.isAfter(start)) {
                    errors.add('"end_time" must be after "start_time".')
                }
            } catch (Exception e) {
                errors.add('Invalid ISO date format for start_time or end_time.')
            }
        }
        return errors
    }
    
    static List<String> validateUpdateBooking(Map data) {
        def errors = []
        // Must have at least one field to update
        if (data.isEmpty()) {
            errors.add('Update request must contain at least one field.')
            return errors
        }

        // Check if end_time is after start_time, but only if both exist
        if (data.start_time && data.end_time) {
             try {
                def start = Instant.parse(data.start_time)
                def end = Instant.parse(data.end_time)
                if (!end.isAfter(start)) {
                    errors.add('"end_time" must be after "start_time".')
                }
            } catch (Exception e) {
                errors.add('Invalid ISO date format for start_time or end_time.')
            }
        }
        return errors
    }

    // Helper function to send a standardized JSON response
    static String respond(res, List<String> errors) {
        res.type('application/json')
        if (errors.isEmpty()) {
            res.status(200)
            return JsonOutput.toJson([valid: true])
        } else {
            res.status(400)
            return JsonOutput.toJson([valid: false, error: errors.join(' ')])
        }
    }
}




//gradle wrapper
//.\gradlew.bat run