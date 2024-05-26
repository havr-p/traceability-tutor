package uniba.fmph.traceability_tutor.repos;

import io.netty.resolver.dns.DnsServerAddresses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import uniba.fmph.traceability_tutor.domain.Item;
import uniba.fmph.traceability_tutor.domain.Relationship;
import uniba.fmph.traceability_tutor.domain.Release;

import java.util.List;


public interface RelationshipRepository extends JpaRepository<Relationship, Long> {

    Relationship findFirstByStartItem(Item item);

    Relationship findFirstByEndItem(Item item);

    Relationship findFirstByRelease(Release release);

    @Query("select r from Relationship r where r.release is null " +
            "and r.endItem.release is null" +
            " and r.startItem.release is null" +
            " and (r.startItem.project.id = ?1" +
            " or r.endItem.project.id = ?1)" +
            " order by r.dateCreated asc")
    List<Relationship> findNonReleaseByProjectId(Long projectId);

    @Query("select r from Relationship r where r.release = ?1 and (r.startItem.id = ?2 " +
            " or r.endItem.id = ?2)")
    List<Relationship> findAllRelatedToItemAndRelease(Long releaseId, Long itemId);
}
