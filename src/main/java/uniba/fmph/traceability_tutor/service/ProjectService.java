package uniba.fmph.traceability_tutor.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import uniba.fmph.traceability_tutor.domain.InternalIdGenerator;
import uniba.fmph.traceability_tutor.config.security.SecretsManager;
import uniba.fmph.traceability_tutor.domain.*;
import uniba.fmph.traceability_tutor.mapper.ItemMapper;
import uniba.fmph.traceability_tutor.mapper.LevelMapper;
import uniba.fmph.traceability_tutor.mapper.ProjectMapper;
import uniba.fmph.traceability_tutor.mapper.RelationshipMapper;
import uniba.fmph.traceability_tutor.model.*;
import uniba.fmph.traceability_tutor.repos.*;
import uniba.fmph.traceability_tutor.util.AppException;
import uniba.fmph.traceability_tutor.util.NotFoundException;
import uniba.fmph.traceability_tutor.util.ReferencedWarning;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static uniba.fmph.traceability_tutor.service.TempCreateRelationshipDTO.readResourceFile;
import static uniba.fmph.traceability_tutor.util.TextUtils.normalizeText;


@Slf4j
@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final IterationRepository iterationRepository;
    private final RelationshipRepository relationshipRepository;
    private final ProjectMapper projectMapper;
    private final SecretsManager secretsManager;
    private final UserService userService;
    private final ItemService itemService;
    private final RelationshipService relationshipService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RelationshipMapper relationshipMapper;
    private final ItemMapper itemMapper;
    private final LevelMapper levelMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final InternalIdGenerator internalIdGenerator;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository, ItemRepository itemRepository, IterationRepository iterationRepository, RelationshipRepository relationshipRepository, ProjectMapper projectMapper, SecretsManager secretsManager, UserService userService, ItemService itemService, RelationshipService relationshipService, RelationshipMapper relationshipMapper, ItemMapper itemMapper, LevelMapper levelMapper, ApplicationEventPublisher eventPublisher, InternalIdGenerator internalIdGenerator) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.iterationRepository = iterationRepository;
        this.relationshipRepository = relationshipRepository;
        this.projectMapper = projectMapper;
        this.secretsManager = secretsManager;
        this.userService = userService;
        this.itemService = itemService;
        this.relationshipService = relationshipService;
        this.relationshipMapper = relationshipMapper;
        this.itemMapper = itemMapper;
        this.levelMapper = levelMapper;
        this.eventPublisher = eventPublisher;
        this.internalIdGenerator = internalIdGenerator;
    }


    public List<ProjectDTO> findAll() {
        return projectRepository.findAll(Sort.by("id")).stream()
                .map(projectMapper::toDto)
                .collect(Collectors.toList());
    }

    public ProjectDTO get(Long id) {
        return projectRepository.findById(id)
                .map(projectMapper::toDto)
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + id));
    }

    public Long create(CreateProjectDTO projectDTO) {
        Project project = projectMapper.toEntity(projectDTO);
        User owner = userService.getCurrentUser();
        project.setOwner(owner);
        project.setLastOpened(OffsetDateTime.now());
        project.setRepoName(getRepoName(projectDTO));

        if (projectDTO.getLevels() != null) {
            List<Level> levels = projectDTO.getLevels().stream()
                    .map(levelDTO -> {
                        Level level = projectMapper.toLevel(levelDTO);
                        level.setProject(project);
                        return level;
                    })
                    .toList();
            project.setLevels(levels);
        }

        Project savedProject = projectRepository.save(project);

        secretsManager.storeSecret(owner, UserSecretType.GITHUB_ACCESS_TOKEN, projectDTO.getAccessToken(), savedProject);

        return savedProject.getId();
    }

    private static String getRepoName(CreateProjectDTO projectDTO) {
        String repoUrl = projectDTO.getRepoUrl();
        Pattern pattern = Pattern.compile("https://github\\.com/[\\w-]+/([\\w-]+)(\\.git)?");
        Matcher matcher = pattern.matcher(repoUrl);

        String repoName = null;
        if (matcher.find()) {
            repoName = matcher.group(1);
        }
        return repoName;
    }


    public void update(final Long id, final ProjectDTO projectDTO) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Project not found with id: " + id));

        projectMapper.updateProjectFromDto(projectDTO, project);

        User owner = userRepository.findById(projectDTO.getOwner())
                .orElseThrow(() -> new NotFoundException("Owner not found"));
        project.setOwner(owner);

        projectRepository.save(project);
    }

    public void delete(Long id) {
        if (!projectRepository.existsById(id)) {
            throw new NotFoundException("Project not found with id: " + id);
        }
        projectRepository.deleteById(id);
    }

    public ReferencedWarning getReferencedWarning(final Long id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final Project project = projectRepository.findById(id)
                .orElseThrow(NotFoundException::new);
        final Item projectItem = itemRepository.findFirstByProject(project);
        if (projectItem != null) {
            referencedWarning.setKey("project.item.project.referenced");
            referencedWarning.addParam(projectItem.getId());
            return referencedWarning;
        }
        final Iteration projectIteration = iterationRepository.findFirstByProject(project);
        if (projectIteration != null) {
            referencedWarning.setKey("project.release.project.referenced");
            referencedWarning.addParam(projectIteration.getId());
            return referencedWarning;
        }
        return null;
    }

    public Long updateLastOpened(final Long id) {
        Project project = projectRepository.findById(id).orElseThrow(NotFoundException::new);
        project.setLastOpened(OffsetDateTime.now());
        var currentProject = projectRepository.save(project);
        return currentProject.getId();
    }

    public List<ProjectDTO> findByOwner(final Long id) {
        Optional<User> owner = userRepository.findById(id);
        if (owner.isPresent()) {
            var result = projectRepository.findAllByOwner(owner.get(), Sort.by(Sort.Direction.DESC, "lastOpened")).stream()
                    .map(projectMapper::toDto)
                    .toList();
            return result;
        } else throw new NotFoundException("User not found with id: " + id);
    }


    public boolean existsByUserAndName(String projectName) {
        return projectRepository.existsByOwnerAndName(userService.getCurrentUser(), projectName);
    }

    @Transactional
    public Long createDemoProject() {
        var user = userService.getCurrentUser();
        return createDemoProjectWithData(user);
    }

    public void setVCSSecret(Long projectId) {
        var user = userService.getCurrentUser();
        var project = projectRepository.findById(projectId).orElseThrow(() -> new NotFoundException("Project with id " + projectId + " was not found."));
        String secret = secretsManager.retrieveSecret(user, project, UserSecretType.GITHUB_ACCESS_TOKEN);

    }

    public ProjectSettings getProjectSettings(Long id) {
        var project = projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project with id " + id + " was not found."));
        var user = userService.getCurrentUser();
        String secret = secretsManager.retrieveSecret(user, project, UserSecretType.GITHUB_ACCESS_TOKEN);
        return new ProjectSettings(project.getName(), project.getRepoName(), secret);
    }

    public void updateSettings(Long id, ProjectSettings settings) {
        var project = projectRepository.findById(id).orElseThrow(() -> new NotFoundException("Project with id " + id + " was not found."));
        project.setName(settings.name());
        project.setRepoName(settings.repoName());
        projectRepository.save(project);
        secretsManager.storeSecret(
                userService.getCurrentUser(),
                UserSecretType.GITHUB_ACCESS_TOKEN,
                settings.accessToken(),
                project
        );
    }

    private Project processProjectConfiguration(Project project, ProjectDTO configuration) {
        project.setName(configuration.getName());
        project.setRepoName(configuration.getRepoName());
        project.setRepoUrl(configuration.getRepoUrl());
        project.getLevels().clear();
        configuration.getLevels().stream()
                .map(levelMapper::toLevel)
                .forEach(project::addLevel);
        var user = userService.getCurrentUser();
        project.setOwner(user);
        project = projectRepository.save(project);
        //secretsManager.storeSecret(user, UserSecretType.GITHUB_ACCESS_TOKEN, configuration.accessToken(), project);
        return project;
    }

    public Project getProjectById(Long id) {
        return projectRepository.findById(id).orElseThrow(() -> new NotFoundException("project with id = " + id + " not found"));
    }

    @Transactional
    public Long createDemoProjectWithData(User user) {
        Project project = createDemoProjectInDb(user);
        setSampleProjectData(project);
        return project.getId();
    }

    public Project setProjectData(Project project, String content) throws IOException {
        eventPublisher.publishEvent(new CurrentProjectChangedEvent(project));
        ObjectMapper mapper = new ObjectMapper().registerModule(new JavaTimeModule());
        JsonNode rootNode = mapper.readTree(content);
        if (rootNode.has("project")) {
            ProjectDTO projectConfig = mapper.treeToValue(rootNode.get("project"), ProjectDTO.class);
            project = processProjectConfiguration(project, projectConfig);
        }
        else throw new AppException("Project configuration is missing in input JSON", HttpStatus.BAD_REQUEST);

        List<JsonItemDTO> itemDTOS = mapper.readValue(
                rootNode.get("items").toString(),
                mapper.getTypeFactory().constructCollectionType(List.class, JsonItemDTO.class)
        );
        List<ItemDTO> normalDTOs = itemDTOS.stream().map(itemMapper::jsonItemDtoToItemDto).toList();

        for (ItemDTO dto:
             normalDTOs) {
            var data = dto.getData();
            String description = data.get("description");
            String name = data.get("name");
            data.put("description", normalizeText(description));
            data.put("name", normalizeText(name));
        }

        Project finalProject = project;
        List<Item> items = itemDTOS.stream()
                .map(dto -> mapToEntity(finalProject, dto))
                .toList();
        itemRepository.saveAllAndFlush(items);

        List<JsonRelationshipDTO> jsonRelationshipDTOS = mapper.readValue(
                rootNode.get("relationships").toString(),
                mapper.getTypeFactory().constructCollectionType(List.class, JsonRelationshipDTO.class)
        );

        jsonRelationshipDTOS.forEach(dto -> dto.setDescription(normalizeText(dto.getDescription())));



        jsonRelationshipDTOS
                .forEach(dto -> {
                    CreateRelationshipDTO normalDTO = relationshipMapper.jsonToDto(dto);
                    relationshipService.create(normalDTO);
                });


        return project;
    }

    public Item mapToEntity(Project project, final TempCreateItemDTO dto) {
        Item item = new Item();

        var data = dto.getData();
        item.setItemType(dto.getItemType());
        item.setData(data);
        item.setStatus(dto.getStatus());
        item.setProject(project);
        item.setInternalId(dto.internalId != null ? dto.internalId : internalIdGenerator.generateNextInternalId());
        return item;
    }

    public Item mapToEntity(Project project, final JsonItemDTO dto) {
        Item item = new Item();

        item.setItemType(dto.getItemType());

        Map<String, String> stringData = dto.getData().entrySet().stream()
                .filter(entry -> entry.getValue() != null)  // Filter out null values
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> {
                            Object value = entry.getValue();
                            if (value instanceof List) {
                                // Handle lists (like "links") by converting to JSON string
                                try {
                                    return new ObjectMapper().writeValueAsString(value);
                                } catch (JsonProcessingException e) {
                                    throw new RuntimeException("Error converting list to JSON", e);
                                }
                            }
                            return value.toString();
                        }
                ));

        item.setData(stringData);
        item.setStatus(dto.getStatus());
        item.setProject(project);
        item.setInternalId(dto.getInternalId() != null ? dto.getInternalId() : internalIdGenerator.generateNextInternalId());
        return item;
    }


    @Transactional
    public void setSampleProjectData(Project project) {
        List<TempCreateItemDTO> tempItemDtos;
        try {
            tempItemDtos = parseJsonToCreateItemDTOs();
            tempItemDtos.forEach(dto -> {
                String description = dto.getData().get("description");
                String name = dto.getData().get("name");
                dto.getData().put("description", normalizeText(description));
                dto.getData().put("name", normalizeText(name));
            });
        } catch (IOException e) {
            log.error("Failed to parse sample items JSON", e);
            tempItemDtos = List.of();
        }
        var list = tempItemDtos.stream().map(dto -> this.mapToEntity(project, dto)).toList();
        itemRepository.saveAllAndFlush(list);


        List<TempCreateRelationshipDTO> tempCreateRelationshipDTOS;
        try {
            tempCreateRelationshipDTOS = parseJsonCreateRelationshipDTOs();
            tempCreateRelationshipDTOS.forEach(dto -> dto.setDescription(normalizeText(dto.getDescription())));
        } catch (IOException e) {
            log.error("Failed to parse sample relationships JSON", e);
            tempCreateRelationshipDTOS = List.of();
        }

        assert itemRepository.existsByInternalId(13393L);
        assert itemRepository.existsByInternalId(13406L);
        assert itemRepository.existsByInternalId(13408L);
        assert itemRepository.existsByInternalId(16177L);

        List<Relationship> relationships = tempCreateRelationshipDTOS.stream()
                .map(dto ->
                        this.relationshipService.mapToEntity(dto, project))
                .toList();

        relationshipRepository.saveAll(relationships);

    }

    private List<TempCreateItemDTO> parseJsonToCreateItemDTOs() throws IOException {
        String ITEMS_JSON_FILE_PATH = "static/tt-requirements.json";
        String jsonContent = readResourceFile(ITEMS_JSON_FILE_PATH);
        return objectMapper.readValue(jsonContent, new TypeReference<>() {
        });
    }

    private List<TempCreateRelationshipDTO> parseJsonCreateRelationshipDTOs() throws IOException {
        String RELATIONSHIPS_JSON_FILE_PATH = "static/tt-relationships.json";
        String jsonContent = readResourceFile(RELATIONSHIPS_JSON_FILE_PATH);
        return objectMapper.readValue(jsonContent, new TypeReference<>() {
        });
    }

    public Project createDemoProjectInDb(User user) {
        String TRACEABILITY_TUTOR_PROJECT_REPO_NAME = "traceability-tutor";
        String TRACEABILITY_TUTOR_PROJECT_NAME = "Traceability Tutor";

        Project traceabilityTutorProject = Project.builder()
                .repoUrl("https://github.com/havr-p/traceability-tutor.git")
                .name(TRACEABILITY_TUTOR_PROJECT_NAME + " # " + (projectRepository.countByOwner(user) + 1))
                .repoName(TRACEABILITY_TUTOR_PROJECT_REPO_NAME)
                .owner(user)
                .lastOpened(OffsetDateTime.now())
                .levels(new ArrayList<>())
                .build();

        traceabilityTutorProject = projectRepository.save(traceabilityTutorProject);

        List<Level> BABOK_LEVELS = Arrays.asList(
                new Level(null, "#fcf6bd", "Business", traceabilityTutorProject),
                new Level(null, "#ff99c8", "Stakeholder", traceabilityTutorProject),
                new Level(null, "#d0f4de", "Solution", traceabilityTutorProject),
                new Level(null, "#FFD275", "Design", traceabilityTutorProject),
                new Level(null, "#a9def9", "Code", traceabilityTutorProject),
                new Level(null, "#e4c1f9", "Test", traceabilityTutorProject)
        );

        for (Level level : BABOK_LEVELS) {
            traceabilityTutorProject.addLevel(level);
        }

        return projectRepository.save(traceabilityTutorProject);
    }

    public void clearProjectEditableContent(Long projectId) {
        this.itemService.deleteAllEditable(projectId);
        this.relationshipService.deleteAllEditable(projectId);
    }

    public ProjectDTO toDto(Project project) {
        return projectMapper.toDto(project);
    }

    public void setCurrentProject(Project project) {
        eventPublisher.publishEvent(new CurrentProjectChangedEvent(project));
    }

    @EventListener
    public void handleCurrentProjectChanged(CurrentProjectChangedEvent event) {
        Project currentProject = event.getProject();
    }
}
