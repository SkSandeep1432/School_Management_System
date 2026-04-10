package com.school.admin.dto.request;

import java.math.BigDecimal;

public record UpdateMarksRequest(
        BigDecimal marksObtained,
        String remarks) {}
