package uniba.fmph.traceability_tutor.service;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import uniba.fmph.traceability_tutor.domain.*;
import uniba.fmph.traceability_tutor.mapper.ItemMapper;
import uniba.fmph.traceability_tutor.model.CreateItemDTO;
import uniba.fmph.traceability_tutor.model.ItemDTO;
import uniba.fmph.traceability_tutor.model.ItemType;
import uniba.fmph.traceability_tutor.repos.ItemRepository;
import uniba.fmph.traceability_tutor.repos.ProjectRepository;
import uniba.fmph.traceability_tutor.repos.RelationshipRepository;
import uniba.fmph.traceability_tutor.repos.IterationRepository;
import uniba.fmph.traceability_tutor.util.NotFoundException;
import uniba.fmph.traceability_tutor.util.ReferencedWarning;

import java.util.List;

import static uniba.fmph.traceability_tutor.config.SwaggerConfig.BEARER_SECURITY_SCHEME;


@Service
@SecurityRequirement(name = BEARER_SECURITY_SCHEME)
public class ItemService {

    private final ItemRepository itemRepository;
    private final ProjectRepository projectRepository;
    private final IterationRepository iterationRepository;
    private final RelationshipRepository relationshipRepository;
    private final ItemMapper itemMapper;
    private final InternalIdGenerator internalIdGenerator;
    private Project currentProject;
    private final ApplicationEventPublisher eventPublisher;

    public ItemService(final ItemRepository itemRepository,
                       final ProjectRepository projectRepository, final IterationRepository iterationRepository,
                       final RelationshipRepository relationshipRepository, ItemMapper itemMapper, InternalIdGenerator internalIdGenerator, ApplicationEventPublisher eventPublisher) {
        this.itemRepository = itemRepository;
        this.projectRepository = projectRepository;
        this.iterationRepository = iterationRepository;
        this.relationshipRepository = relationshipRepository;
        this.itemMapper = itemMapper;
        this.internalIdGenerator = internalIdGenerator;
        this.eventPublisher = eventPublisher;
    }

    public List<ItemDTO> findAll() {
        final List<Item> items = itemRepository.findAll(Sort.by("id"));
        return items.stream()
                .map(this::mapToDTO)
                .toList();
    }

    public ItemDTO get(final Long id) {
        return itemRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(NotFoundException::new);
    }

    public ItemDTO create(final CreateItemDTO createItemDTO) {
        var item = itemRepository.save(mapToEntity(createItemDTO));
        return itemMapper.toDto(item);
    }

    public ItemDTO create(final ItemDTO itemDTO) {
        var item = itemRepository.save(mapToEntity(itemDTO));
        return itemMapper.toDto(item);
    }
    public List<ItemDTO> createMultiple(final List<ItemDTO> itemDTOs) {
        var mapped = itemDTOs.stream().map(this::mapToEntity).toList();
        List<Item> items = itemRepository.saveAllAndFlush(mapped);
        return items.stream().map(itemMapper::toDto).toList();
    }

    public Long update(final Long id, final ItemDTO itemDTO) {
        Item item = itemRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        updateItem(item, itemDTO);
        return itemRepository.save(item).getInternalId();
    }

    public void deleteIfExists(final Long id) {
        if (itemRepository.existsById(id)) itemRepository.deleteById(id);
    }

    private ItemDTO mapToDTO(final Item item) {
        return itemMapper.toDto(item);
    }

    private Item mapToEntity(final ItemDTO itemDTO) {
        Item item = new Item();
        updateItem(item, itemDTO);
        return item;
    }

    public Item mapToEntity(final CreateItemDTO createItemDTO) {
        Item item = new Item();
        var data = createItemDTO.getData();
        item.setItemType(createItemDTO.getItemType());
        item.setData(data);
        item.setStatus(createItemDTO.getStatus());
        // internal id will be the same in all iterations
        item.setInternalId(internalIdGenerator.generateNextInternalId());
        final Project project = createItemDTO.getProjectId() == null ? null : projectRepository.findById(createItemDTO.getProjectId())
                .orElseThrow(() -> new NotFoundException("Project with id " + createItemDTO.getProjectId() + "was not found when creating the new item."));
        item.setProject(project);
        return item;
    }

    private void updateItem(Item item, final ItemDTO itemDTO) {
            item.setItemType(itemDTO.getItemType());
            item.setData(itemDTO.getData());
            item.setStatus(itemDTO.getStatus());
            item.setHistoryAction(itemDTO.getHistoryAction());
            final Project project = itemDTO.getProjectId() == null ? null : projectRepository.findById(itemDTO.getProjectId())
                    .orElseThrow(() -> new NotFoundException("project not found"));
            item.setProject(project);
            final Iteration iteration = itemDTO.getIterationId() == null ? null : iterationRepository.findById(itemDTO.getIterationId())
                    .orElseThrow(() -> new NotFoundException("iteration not found"));
            item.setIteration(iteration);
            item.setInternalId(itemDTO.getInternalId());
    }

    public ReferencedWarning getReferencedWarning(final Long id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final Item item = itemRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        final Relationship parentRelationship = relationshipRepository.findFirstByStartItem(item);
        if (parentRelationship != null) {
            referencedWarning.setKey("item.relationship.startItem.referenced");
            referencedWarning.addParam(parentRelationship.getId());
            return referencedWarning;
        }
        final Relationship childRelationship = relationshipRepository.findFirstByEndItem(item);
        if (childRelationship != null) {
            referencedWarning.setKey("item.relationship.childItem.referenced");
            referencedWarning.addParam(childRelationship.getId());
            return referencedWarning;
        }
        return null;
    }

    public List<ItemDTO> getProjectEditableItems(Long projectId) {
        Project project = projectRepository.findById(projectId).orElseThrow(NotFoundException::new);
        eventPublisher.publishEvent(new CurrentProjectChangedEvent(project));
        return itemRepository.findNonIterationByProjectId(projectId).stream()
                .map(itemMapper::toDto)
                .toList();
    }

    public void setIteration(Long itemId, Iteration iteration) {
        itemRepository.updateIterationById(iteration, itemId);
    }

    public Item findLastestCodeItem(Long projectId) {
        return itemRepository.findFirstByProject_IdAndItemTypeOrderByDateCreatedDesc(projectId, ItemType.CODE);
    }

    public void deleteAllEditable(Long projectId) {
        itemRepository.deleteByProject_IdAndIterationNull(projectId);
    }
    @EventListener
    public void handleCurrentProjectChanged(CurrentProjectChangedEvent event) {
        this.currentProject = event.getProject();
    }
}
