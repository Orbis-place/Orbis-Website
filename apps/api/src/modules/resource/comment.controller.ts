import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { CommentService } from './comment.service';
import { CreateResourceCommentDto } from './dtos/create-resource-comment.dto';

@ApiTags('Resources')
@Controller('resources')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    @Get(':id/comments')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get comments for a resource' })
    async getComments(
        @Param('id') resourceId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.commentService.getComments(resourceId, page || 1, limit || 20);
    }

    @Post(':id/comments')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a comment to a resource' })
    async createComment(
        @Session() session: UserSession,
        @Param('id') resourceId: string,
        @Body() createDto: CreateResourceCommentDto,
    ) {
        return this.commentService.createComment(resourceId, session.user.id, createDto);
    }

    @Delete(':id/comments/:commentId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a comment' })
    async deleteComment(
        @Session() session: UserSession,
        @Param('commentId') commentId: string,
    ) {
        return this.commentService.deleteComment(commentId, session.user.id);
    }
}
