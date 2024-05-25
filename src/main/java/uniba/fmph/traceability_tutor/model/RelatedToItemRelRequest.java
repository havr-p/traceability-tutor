package uniba.fmph.traceability_tutor.model;

import java.util.Optional;

public record RelatedToItemRelRequest(Long itemId, Optional<Long> releaseId) {
}
