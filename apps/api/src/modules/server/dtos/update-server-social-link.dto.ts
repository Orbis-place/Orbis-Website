import { PartialType } from '@nestjs/swagger';
import { CreateServerSocialLinkDto } from './create-server-social-link.dto';

export class UpdateServerSocialLinkDto extends PartialType(CreateServerSocialLinkDto) { }
