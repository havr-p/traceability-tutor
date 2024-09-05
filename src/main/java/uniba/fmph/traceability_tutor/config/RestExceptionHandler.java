package uniba.fmph.traceability_tutor.config;


import com.auth0.jwt.exceptions.JWTVerificationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import uniba.fmph.traceability_tutor.model.ErrorDTO;
import uniba.fmph.traceability_tutor.util.AppException;
import uniba.fmph.traceability_tutor.util.NotFoundException;

@Slf4j
@ControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(value = {AppException.class})
    @ResponseBody
    public ResponseEntity<ErrorDTO> handleException(AppException ex) {
        return ResponseEntity
                .status(ex.getStatus())
                .body(new ErrorDTO(ex.getMessage()));
    }

    @ExceptionHandler(value = {JWTVerificationException.class})
    @ResponseBody
    public ResponseEntity<ErrorDTO> handleException(JWTVerificationException ex) {
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorDTO(ex.getMessage()));
    }

    @ExceptionHandler(value = {NotFoundException.class})
    @ResponseBody
    public ResponseEntity<ErrorDTO> handleException(NotFoundException ex) {
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorDTO(ex.getMessage()));
    }

    @ExceptionHandler(value = {Exception.class})
    @ResponseBody
    public ResponseEntity<ErrorDTO> handleException(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorDTO("Internal server error"));
    }
}
