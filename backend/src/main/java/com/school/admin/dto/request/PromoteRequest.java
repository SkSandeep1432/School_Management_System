package com.school.admin.dto.request;

import jakarta.validation.constraints.NotNull;

public record PromoteRequest(
        @NotNull(message = "Source class ID is required") Long fromClassId,
        Long toClassId  // null means graduate (remove from active rolls)
) {}
