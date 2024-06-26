package uniba.fmph.traceability_tutor.repos;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import uniba.fmph.traceability_tutor.domain.Project;
import uniba.fmph.traceability_tutor.domain.User;

import java.util.List;


public interface ProjectRepository extends JpaRepository<Project, Long> {
    long countByOwner(User owner);
    boolean existsByOwnerAndName(@NonNull User owner, @NonNull String name);

    Project findFirstByOwner(User user);

    List<Project> findAllByOwner(User owner, Sort lastOpened);

    long count();

}
