import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AllowAnonymous, Session, UserSession } from '@thallesp/nestjs-better-auth';
import { ShowcaseCommentService } from './showcase-comment.service';
import { CreateShowcaseCommentDto } from './dtos/create-showcase-comment.dto';

@ApiTags('Showcase')
@Controller('showcase')
export class ShowcaseCommentController {
    constructor(private readonly commentService: ShowcaseCommentService) { }

    @Get(':id/comments')
    @AllowAnonymous()
    @ApiOperation({ summary: 'Get comments for a showcase post' })
    async getComments(
        @Param('id') postId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.commentService.getComments(postId, page || 1, limit || 20);
    }

    @Post(':id/comments')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add a comment to a showcase post' })
    async createComment(
        @Session() session: UserSession,
        @Param('id') postId: string,
        @Body() createDto: CreateShowcaseCommentDto,
    ) {
        return this.commentService.createComment(postId, session.user.id, createDto);
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
