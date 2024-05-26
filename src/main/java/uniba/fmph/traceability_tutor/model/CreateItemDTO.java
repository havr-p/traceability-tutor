package uniba.fmph.traceability_tutor.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.util.Map;


@Getter
@Setter
@AllArgsConstructor
public class CreateItemDTO {

    @NotNull
    Long projectId;

    @NotNull
    private ItemType itemType;

    @NotNull
    private Map<String, String> data;

    @Size(max = 255)
    private String status;

}
