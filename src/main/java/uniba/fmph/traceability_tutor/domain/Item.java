package uniba.fmph.traceability_tutor.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import uniba.fmph.traceability_tutor.model.HistoryAction;
import uniba.fmph.traceability_tutor.model.ItemType;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Set;


@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@ToString(onlyExplicitlyIncluded = true)
public class Item {

    @Id
    @Column(nullable = false, updatable = false)
    @SequenceGenerator(
            name = "primary_sequence",
            sequenceName = "primary_sequence",
            allocationSize = 1,
            initialValue = 10000
    )
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "primary_sequence")
    @ToString.Include
    private Long id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @ToString.Include
    private ItemType itemType;

    @Column(nullable = false, columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @ToString.Include
    private Map<String, String> data;

    @Column
    @ToString.Include
    private String status;


    @Column(nullable = false)
    @ToString.Include
    private Long internalId;

    @Column
    @Enumerated(EnumType.STRING)
    @ToString.Include
    private HistoryAction historyAction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToMany(mappedBy = "startItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Relationship> parentRelationships;

    @OneToMany(mappedBy = "endItem", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Relationship> childRelationships;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "iteration_id")
    private Iteration iteration;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    @ToString.Include
    private OffsetDateTime dateCreated;

    @LastModifiedDate
    @Column(nullable = false)
    @ToString.Include
    private OffsetDateTime lastUpdated;

}
