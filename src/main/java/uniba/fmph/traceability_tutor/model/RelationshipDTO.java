package uniba.fmph.traceability_tutor.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RelationshipDTO {

    @NotNull
    private Long id;

    @NotNull
    private RelationshipType type;

    private HistoryAction historyAction;

    @Size(max = 255)
    private String description;

    @NotNull
    private Long startItem;

    @NotNull
    private Long endItem;

    private Long release;

}
